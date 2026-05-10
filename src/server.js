// ==========================================
// CRUD DE USUÁRIOS
// ==========================================

/**
 * @swagger
 * /usuariocadastrados:
 *   post:
 *     summary: Cadastrar um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@checar.com"
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               tipoUsuario:
 *                 type: string
 *                 enum: [Motorista, Gestor]
 *                 default: Motorista
 *                 example: "Motorista"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: "Usuário criado com sucesso!"
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Erro na validação dos dados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/usuariocadastrados', async (req, res) => {
    try {
        const { nome, email, senha, tipoUsuario } = req.body;

        // Validação de campos obrigatórios
        if (!nome || !email || !senha) {
            return res.status(400).json({ 
                erro: "Campos obrigatórios",
                mensagem: "Nome, email e senha são obrigatórios." 
            });
        }

        // Verificar se email já está cadastrado
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ 
                erro: "Email já cadastrado",
                mensagem: "Este email já está em uso." 
            });
        }

        // Criar novo usuário
        const novoUsuario = new Usuario({
            nome,
            email,
            senha,
            tipoUsuario: tipoUsuario || "Motorista"
        });

        await novoUsuario.save();

        // Remover a senha da resposta
        const usuarioResponse = {
            id: novoUsuario._id,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            tipoUsuario: novoUsuario.tipoUsuario,
            createdAt: novoUsuario.createdAt
        };

        res.status(201).json({ 
            mensagem: "Usuário criado com sucesso!",
            usuario: usuarioResponse
        });

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ 
            erro: "Erro ao criar usuário",
            detalhe: error.message 
        });
    }
});

// Rota alternativa com o padrão REST (opcional)
/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cadastrar um novo usuário (rota alternativa)
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               tipoUsuario:
 *                 type: string
 *                 enum: [Motorista, Gestor]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
app.post('/usuarios', async (req, res) => {
    // Reutilizar a mesma lógica da rota principal
    req.url = '/usuariocadastrados';
    app._router.handle(req, res);
});

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-senha');
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ 
            erro: "Erro ao listar usuários", 
            detalhe: error.message 
        });
    }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 */
app.get('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ erro: "ID inválido" });
        }

        const usuario = await Usuario.findById(id).select('-senha');
        
        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ 
            erro: "Erro ao buscar usuário", 
            detalhe: error.message 
        });
    }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualizar um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               tipoUsuario:
 *                 type: string
 *                 enum: [Motorista, Gestor]
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
app.put('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, tipoUsuario, senha } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ erro: "ID inválido" });
        }

        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        // Verificar se o novo email já existe (se estiver mudando)
        if (email && email !== usuario.email) {
            const emailExistente = await Usuario.findOne({ email });
            if (emailExistente) {
                return res.status(400).json({ 
                    erro: "Email já cadastrado",
                    mensagem: "Este email já está em uso por outro usuário." 
                });
            }
        }

        // Atualizar campos
        if (nome) usuario.nome = nome;
        if (email) usuario.email = email;
        if (tipoUsuario) usuario.tipoUsuario = tipoUsuario;
        if (senha) usuario.senha = senha;

        await usuario.save();

        const usuarioResponse = {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario,
            updatedAt: usuario.updatedAt
        };

        res.status(200).json({
            mensagem: "Usuário atualizado com sucesso!",
            usuario: usuarioResponse
        });

    } catch (error) {
        res.status(500).json({ 
            erro: "Erro ao atualizar usuário", 
            detalhe: error.message 
        });
    }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Deletar um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
app.delete('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ erro: "ID inválido" });
        }

        const usuario = await Usuario.findByIdAndDelete(id);

        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        res.status(200).json({
            mensagem: "Usuário deletado com sucesso!",
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email
            }
        });

    } catch (error) {
        res.status(500).json({ 
            erro: "Erro ao deletar usuário", 
            detalhe: error.message 
        });
    }
});