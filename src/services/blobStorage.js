import { BlobServiceClient } from '@azure/storage-blob';
import crypto from 'crypto';

const CONTAINER = process.env.AZURE_PHOTOS_CONTAINER_NAME || 'fotos';

const getContainerClient = () => {
    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!conn) return null;
    return BlobServiceClient.fromConnectionString(conn).getContainerClient(CONTAINER);
};

/**
 * Faz upload de um buffer JPEG comprimido para o Azure Blob Storage.
 * Retorna a URL pública do blob, ou null se Azure não estiver configurado
 * (o chamador deve tratar o null fazendo fallback para disco).
 *
 * @param {Buffer} buffer   - Buffer JPEG já comprimido
 * @param {string} originalname - Nome original do arquivo (usado como sufixo no blob)
 * @returns {Promise<string|null>} URL pública ou null
 */
export const uploadPhoto = async (buffer, originalname) => {
    const containerClient = getContainerClient();
    if (!containerClient) return null;

    const baseName = originalname.replace(/\s+/g, '_').replace(/\.[^.]+$/, '');
    const filename  = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${baseName}.jpg`;
    const blobClient = containerClient.getBlockBlobClient(filename);

    await blobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: 'image/jpeg' },
    });

    return blobClient.url;
};
