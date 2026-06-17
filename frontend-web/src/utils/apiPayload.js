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
