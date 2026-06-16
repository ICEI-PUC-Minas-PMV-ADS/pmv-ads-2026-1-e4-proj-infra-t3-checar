import { BlobServiceClient } from '@azure/storage-blob';
import crypto from 'crypto';

const CONTAINER = process.env.AZURE_STORAGE_CONTAINER_NAME || 'assinaturas';

const getContainerClient = () => {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!conn) return null;
  return BlobServiceClient.fromConnectionString(conn).getContainerClient(CONTAINER);
};

/**
 * Faz upload de uma assinatura PNG (Base64 ou data URL) para o Azure Blob Storage.
 * Se AZURE_STORAGE_CONNECTION_STRING não estiver configurada, retorna o Base64 diretamente
 * como fallback para ambiente de desenvolvimento.
 *
 * @param {string} base64 — data URL (data:image/png;base64,...) ou Base64 puro
 * @returns {Promise<string>} URL pública do blob ou o próprio Base64 (fallback dev)
 */
export const uploadSignature = async (base64) => {
  const containerClient = getContainerClient();
  if (!containerClient) return base64;

  const raw = base64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(raw, 'base64');
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.png`;
  const blobClient = containerClient.getBlockBlobClient(filename);

  await blobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: 'image/png' },
  });

  return blobClient.url;
};
