const User = require('../models/Users');
const bcrypt = require('bcrypt');
const createUserToken = require('../helpers/create-user-token');

module.exports = class UserController {
    // POST /usuarios/register - Cadastro de técnico
    static async register(req, res) {
        const { nome, email, senha, telefone } = req.body;

        try {
            // Verficar email duplo
            const userExists = await User.findOne({ where: { email: email } });
            if (userExists) {
                return res.status(422).json({ message: 'Este email já está em uso' });
            }

            // Gerar o salt e hash de senha
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash(senha, salt);

            // Conexão no banco via Sequelize
            const novoUsuario = await User.create({
                nome,
                email,
                senha: passwordHash,
                telefone
            });

            // Emitir token JWT diretamente após o registro
            return await createUserToken(novoUsuario, req, res)
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno ao cadastrar usuário', details: error.message });
        }
    }

    // POST /usuarios/login - Autenticação
    static async login(req, res) {
        const { email, senha } = req.body;

        try {
            // Buscando por email
            const user = await User.findOne({ where: { email: email } });
            if (!user) {
                return res.status(422).json({ message: 'Credenciais inválidas: Email não encontrado!' });
            }

            // Validar senha
            const senhaValida = await bcrypt.compare(senha, user.senha);
            if (!senhaValida) {
                return res.status(422).json({ message: 'Credenciais inválidas: Senha incorreta!' });
            }

            // Emitir token JWT de acesso
            return await createUserToken(user, req, res);
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno durante o login', error: error.message });
        }
    }

    // GET /usuarios/checkuser - Retornar os dados do utilizador logado decodificados do token
    static async checkUser(req, res) {
        try {
            // req.user foi injetado pelo middleware verifyToken
            const user = await User.findByPk(req.user.id, {
                attributes: { exclude: ['senha'] } // Para segurança, pois nunca irá expor a hash da senha
            });

            if (!user) {
                return res.status(404).json({ message: 'Utilizador não encontrado!' });
            }

            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno ao validar utilizador', error: error.message });
        }
    }

    // PATCH /usuarios/edit - Atualizar dados do perfil
    static async editUser(req, res) {
        const { nome, telefone, senha } = req.body;
        const usuarioId = req.user.id || req.user.userId;

        try {
            const user = await User.findByPk(usuarioId);
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado!' });
            }

            // Atualiza campos opcionais se forem informados
            if (nome) user.nome = nome;
            if (telefone !== undefined) user.telefone = telefone;

            // Se enviou nova senha, valida tamanho e gera nova hash
            if (senha) {
                if (senha.length < 6) {
                    return res.status(422).json({ message: 'A nova senha deve ter no mínimo 6 caracteres!' });
                }
                const salt = await bcrypt.genSalt(12);
                user.senha = await bcrypt.hash(senha, salt);
            }

            await user.save();

            return res.status(200).json({
                message: 'Perfil atualizado com sucesso!',
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    telefone: user.telefone
                }
            });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao atualizar dados', error: error.message });
        }
    }

    // DELETE /usuarios/delete-my-account - Excluir a própria conta do técnico 
    static async deleteAccount(req, res) {
        try {
            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'Utilizador não encontrado' });
            }

            await user.destroy();
            return res.status(200).json({ message: 'Conta de técnico removida com sucesso!' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao excluir conta', error: error.message });
        }
    }
}