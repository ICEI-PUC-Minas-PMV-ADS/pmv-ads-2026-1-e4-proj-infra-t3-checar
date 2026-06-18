/**
 * Middleware de autorização por perfil (RBAC).
 *
 * Deve ser usado APÓS authMiddleware — depende de req.user estar preenchido.
 *
 * Regras de negócio:
 *   Motorista : criar/consultar checklists, ver veículos, cadastrar veículo (campo),
 *               criar/editar modelos de checklist, subir fotos
 *   Gestor    : tudo do Motorista + excluir veículos/modelos, relatórios, auditoria, usuários
 *
 * Uso:
 *   router.post('/vehicles', authorize('Gestor'), handler)
 *   router.get('/relatorios', authorize('Gestor'), handler)
 *   router.get('/checklists', authorize('Motorista', 'Gestor'), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ erro: 'Autenticação necessária.' });
  }

  if (!roles.includes(req.user.tipoUsuario)) {
    return res.status(403).json({
      erro: 'Acesso negado.',
      mensagem: `Esta operação requer perfil: ${roles.join(' ou ')}.`,
    });
  }

  next();
};

export default authorize;
