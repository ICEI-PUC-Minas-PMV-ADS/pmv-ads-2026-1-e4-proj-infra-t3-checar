import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { compressToBuffer, makeCompressImages } from '../services/imageCompressor.js';
import { uploadPhoto } from '../services/blobStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}. Use JPEG, PNG ou WEBP.`), false);
    }
};

// Multer com memoryStorage: buffers processados antes de qualquer escrita
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB por arquivo
});

// Middleware legado — escreve em disco (mantido para compatibilidade com testes)
const compressImages = makeCompressImages(uploadDir);

/**
 * Middleware de processamento de imagens com suporte a Azure Blob Storage.
 *
 * Fluxo:
 *   1. Comprime cada buffer via sharp → JPEG 1280px / 75 q
 *   2. Se AZURE_STORAGE_CONNECTION_STRING estiver configurada → upload para Blob → file.path = URL
 *   3. Caso contrário (dev/test) → escreve em disco → file.path = caminho local
 *
 * O valor de file.path é sempre uma string válida (URL ou caminho),
 * compatível com o campo fotos.* do modelo Inspecao.
 */
const processImages = async (req, _res, next) => {
    if (!req.files) return next();

    try {
        for (const files of Object.values(req.files)) {
            for (const file of files) {
                const compressed = await compressToBuffer(file.buffer);
                const blobUrl    = await uploadPhoto(compressed, file.originalname);

                if (blobUrl) {
                    // Produção: URL pública do Azure Blob
                    file.path     = blobUrl;
                    file.filename = blobUrl.split('/').pop();
                } else {
                    // Fallback (dev / sem credenciais Azure): escreve em disco
                    const baseName   = file.originalname.replace(/\s+/g, '_').replace(/\.[^.]+$/, '');
                    const filename   = `${Date.now()}-${baseName}.jpg`;
                    const outputPath = path.join(uploadDir, filename);
                    await fs.promises.writeFile(outputPath, compressed);
                    file.path     = outputPath;
                    file.filename = filename;
                }
            }
        }
        next();
    } catch (err) {
        next(err);
    }
};

export { compressImages, processImages };
export default upload;
