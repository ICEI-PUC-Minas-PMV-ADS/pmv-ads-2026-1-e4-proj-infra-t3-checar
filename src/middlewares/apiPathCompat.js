/**
 * Compatibilidade com proxy Vite (dev web): /api/vehicles → /vehicles no backend.
 * Reescreve para /api/* quando a requisição é claramente de API (JSON/auth),
 * sem interferir em navegação do browser (HTML).
 */
const API_ROOT_PREFIXES = [
  '/vehicles',
  '/checklists',
  '/itemchecklists',
  '/modelochecklists',
  '/inspecoes',
  '/inspecao',
  '/notificacoes',
  '/usuarios',
  '/usuariocadastrados',
  '/login',
  '/fcm-tokens',
  '/meus-dados',
  '/aceitar-termos',
  '/exportacoes',
  '/relatorios',
  '/auditoria',
  '/me',
];

const matchesApiRoot = (pathname) =>
  API_ROOT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

const isApiRequest = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) return true;

  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('application/json')) return true;
  if (contentType.includes('multipart/form-data')) return true;

  const accept = req.headers.accept || '';
  if (accept.includes('application/json') && !accept.includes('text/html')) return true;

  if (req.headers['x-requested-with']) return true;

  return req.method !== 'GET';
};

const apiPathCompat = (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (!matchesApiRoot(req.path)) return next();
  if (!isApiRequest(req)) return next();

  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  req.url = `/api${req.path}${query}`;
  return req.app.handle(req, res, next);
};

export default apiPathCompat;
