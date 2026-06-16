import path from 'path';
import sharp from 'sharp';

/**
 * Comprime um buffer de imagem para JPEG e retorna o buffer resultante.
 * Usado pelo middleware processImages antes do upload para Azure.
 *
 * @param {Buffer} buffer - Buffer bruto da imagem
 * @returns {Promise<Buffer>} Buffer JPEG comprimido
 */
const compressToBuffer = (buffer) =>
    sharp(buffer)
        .resize({ width: 1280, withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();

/**
 * Compress every uploaded file in req.files using sharp.
 * Files must have a `buffer` property (multer memoryStorage).
 * After processing each file gains `path` and `filename`.
 *
 * @param {string} uploadDir - absolute path to the uploads directory
 */
const makeCompressImages = (uploadDir) => async (req, _res, next) => {
    if (!req.files) return next();

    try {
        for (const files of Object.values(req.files)) {
            for (const file of files) {
                const baseName   = file.originalname.replace(/\s+/g, '_').replace(/\.[^.]+$/, '');
                const filename   = `${Date.now()}-${baseName}.jpg`;
                const outputPath = path.join(uploadDir, filename);

                await sharp(file.buffer)
                    .resize({ width: 1280, withoutEnlargement: true })
                    .jpeg({ quality: 75 })
                    .toFile(outputPath);

                file.path     = outputPath;
                file.filename = filename;
            }
        }
        next();
    } catch (err) {
        next(err);
    }
};

export { compressToBuffer, makeCompressImages };
