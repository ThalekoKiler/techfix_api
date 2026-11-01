const bcrypt = require('bcryptjs');
const { User, Game } = require('../models');
const createUserToken = require('../helpers/create-user-token');

class UserController {
    // POST /usuario/register
    static async register(req, res) {
        const { name, email, password } = req.body;

        try {
            // Verificar dupliciadade de email
            const userExists = await User.findOne({ where: { email } });
            if (userExists) {
                return res.status(422).json({ error: 'Este email já está em uso!' });
            }

            // Criar Hash da senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Salvar no banco
            const user = await User.create({
                name,
                email,
                password: hashedPassword
            });

            return await createUserToken(user, req, res);
        } catch (error) {
            console.error('ERRO DETALHADO NO REGISTO:', error);
            return res.status(500).json({ error: 'Erro ao registrar usuário', details: error.message });
        }
    }

    // POST /usuario/login
    static async login(req, res) {
        const { email, password } = req.body;

        try {
            // Buscar usuário por email
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            // Comparar senha criptografada
            const checkPassword = await bcrypt.compare(password, user.password);
            if (!checkPassword) {
                return res.status(422).json({ error: 'Senha incorreta.' });
            }

            // Retornar os JSONS
            return await createUserToken(user, req, res);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao realizar login.', details: error.message });
        }
    }

    // GET /usuario/me
    static async checkUser(req, res) {
        try {
            const user = await User.findByPk(req.userId, {
                attributes: { exclude: ['password'] } // Nunca expõe a senha
            });

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar usuário logado.' });
        }
    }

    // GET /usuario/estatisticas
    static async getStats(req, res) {
        try {
            console.log('Buscando estatísticas para o userId:', req.userId);

            const games = await Game.findAll({
                where: { userId: req.userId }
            });

            console.log(`Encontrados ${games.length} jogos para o usuário.`);

            const total = games.length;
            const concluidos = games.filter(g => g.status === 'concluido').length;
            const jogando = games.filter(g => g.status === 'jogando').length;
            const desejados = games.filter(g => g.status === 'desejado').length;

            // Converte para Number antes de somar para evitar concatenação de strings
            const avaliados = games.filter(g => g.rating !== null && g.rating !== undefined && g.rating !== '');

            let mediaNotas = 0;
            if (avaliados.length > 0) {
                const soma = avaliados.reduce((acc, g) => acc + Number(g.rating), 0);
                mediaNotas = (soma / avaliados.length).toFixed(1);
            }

            return res.status(200).json({
                totalGames: total,
                concluidos,
                jogando,
                desejados,
                mediaNotas: parseFloat(mediaNotas)
            });
        } catch (error) {
            console.error('ERRO AO BUSCAR ESTATÍSTICAS:', error);
            return res.status(500).json({ error: 'Erro ao calcular estatísticas.', details: error.message });
        }
    }

}

module.exports = UserController;