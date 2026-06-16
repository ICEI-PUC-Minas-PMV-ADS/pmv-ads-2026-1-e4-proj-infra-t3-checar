import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
<<<<<<< HEAD
=======
import { makeCompressImages } from '../services/imageCompressor.js';
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

<<<<<<< HEAD
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

=======
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}. Use JPEG, PNG ou WEBP.`), false);
  }
};

<<<<<<< HEAD
const upload = multer({
  storage,
=======
// Memory storage so sharp can process the buffer before writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

<<<<<<< HEAD
=======
const compressImages = makeCompressImages(uploadDir);

export { compressImages };
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
export default upload;
