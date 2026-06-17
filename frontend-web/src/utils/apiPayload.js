/**
 * Normaliza payloads de listagem da API para sempre retornar um array.
 * Suporta contratos: { data: [] }, { status, data: [] } ou array direto (legado).
 */
export function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

/**
 * Normaliza metadados de paginação independente do contrato da resposta.
 */
export function extractPageMeta(payload) {
  return {
    data: extractList(payload),
    total: payload?.total ?? extractList(payload).length,
    totalPages: payload?.totalPages ?? 1,
    page: payload?.page ?? 1,
  };
}

/** Mensagem de erro legível — preserva texto do backend (401/503/500). */
export function getApiErrorMessage(error, fallback = 'Não foi possível completar a operação.') {
  const status = error.response?.status;
  const msg = error.message;

  if (status === 503) {
    return msg || 'Serviço temporariamente indisponível. Tente novamente em instantes.';
  }
  if (status === 401) {
    if (error.response?.data?.erro === 'Usuário não encontrado.') {
      return 'Conta sem cadastro local. Faça o cadastro em /cadastro ou contate o suporte.';
    }
    return msg || 'Não foi possível autenticar. Tente sair e entrar novamente.';
  }
  if (status >= 500) {
    return msg || 'Erro no servidor. Tente novamente em instantes.';
  }
  return msg || fallback;
}
