import Usuario from '../models/Usuario.js';

// Cadastrar novo usuário
export const registrarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, tipoUsuario } = req.body;

        // Verificar se usuário já existe
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
            tipoUsuario
        });

        await novoUsuario.save();

        // Retornar usuário sem a senha
        const usuarioResponse = {
            id: novoUsuario._id,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            tipoUsuario: novoUsuario.tipoUsuario,
            createdAt: novoUsuario.createdAt
        };

        res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            usuario: usuarioResponse
        });

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error.message);
        res.status(500).json({ 
            erro: "Erro ao cadastrar usuário", 
            detalhe: error.message 
        });
    }
};

// Login de usuário
export const loginUsuario = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ 
                erro: "Campos obrigatórios",
                mensagem: "Email e senha são obrigatórios." 
            });
        }

        // Buscar usuário incluindo a senha (select: false)
        const usuario = await Usuario.findOne({ email }).select('+senha');

        if (!usuario) {
            return res.status(401).json({ 
                erro: "Credenciais inválidas",
                mensagem: "Email ou senha incorretos." 
            });
        }

        // Verificar senha
        const senhaValida = await usuario.compararSenha(senha);

        if (!senhaValida) {
            return res.status(401).json({ 
                erro: "Credenciais inválidas",
                mensagem: "Email ou senha incorretos." 
            });
        }

        // Login bem-sucedido
        const usuarioResponse = {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario
        };

        res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            usuario: usuarioResponse
        });

    } catch (error) {
        console.error("Erro no login:", error.message);
        res.status(500).json({ 
            erro: "Erro no servidor", 
            detalhe: error.message 
        });
    }
};

// Listar todos os usuários (apenas para gestores)
export const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-senha');
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ 
            erro: "Erro ao listar usuários", 
            detalhe: error.message 
        });
    }
};

// Buscar usuário por ID
export const buscarUsuarioPorId = async (req, res) => {
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
};

// Atualizar usuário
export const atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, tipoUsuario } = req.body;

        const usuario = await Usuario.findByIdAndUpdate(
            id,
            { nome, email, tipoUsuario },
            { new: true, runValidators: true }
        ).select('-senha');

        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        res.status(200).json({
            mensagem: "Usuário atualizado com sucesso!",
            usuario
        });
    } catch (error) {
        res.status(500).json({ 
            erro: "Erro ao atualizar usuário", 
            detalhe: error.message 
        });
    }
};

// Deletar usuário
export const deletarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findByIdAndDelete(id);

        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        res.status(200).json({
            mensagem: "Usuário deletado com sucesso!"
        });
    } catch (error) {
        res.status(500).json({ 
            erro: "Erro ao deletar usuário", 
            detalhe: error.message 
        });
    }
};