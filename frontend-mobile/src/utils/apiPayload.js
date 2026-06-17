export function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export function getApiErrorMessage(error, fallback = 'Não foi possível completar a operação.') {
  const status = error.response?.status;
  const msg =
    error.response?.data?.erro ||
    error.response?.data?.mensagem ||
    error.response?.data?.message ||
    error.message;

  if (status === 503) {
    return msg || 'Serviço temporariamente indisponível. Tente novamente em instantes.';
  }
  if (status === 401) {
    return msg || 'Sessão expirada. Faça login novamente.';
  }
  if (status >= 500) {
    return msg || 'Erro no servidor. Tente novamente em instantes.';
  }
  return msg || fallback;
}
