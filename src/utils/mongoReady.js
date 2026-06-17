import mongoose from 'mongoose';

export const isMongoReady = () => mongoose.connection.readyState === 1;

export const isConnectivityError = (error) =>
  error?.name === 'MongoNetworkError' ||
  error?.name === 'MongoServerSelectionError' ||
  error?.name === 'MongoExpiredSessionError' ||
  /ECONNRESET|ETIMEDOUT|ENOTFOUND/.test(error?.message ?? '');

export const mongoUnavailableResponse = (res, tag) => {
  console.warn(`[${tag}] MongoDB indisponível. readyState:`, mongoose.connection.readyState);
  return res.status(503).json({
    status: 'error',
    message: 'Database temporarily unavailable. Please retry.',
  });
};

export const dbErrorResponse = (res, tag, error) => {
  console.error(`[${tag}]`, error?.name, error?.message);
  const connectivity = isConnectivityError(error);
  return res.status(connectivity ? 503 : 500).json({
    status: 'error',
    message: connectivity ? 'Database temporarily unavailable. Please retry.' : 'Internal server error',
    ...(connectivity ? {} : { erro: 'Erro interno do servidor.' }),
  });
};
