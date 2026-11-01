const { Op, HasMany } = require('sequelize');
const { Game, User } = require('../models');
const ExcelJS = require('exceljs');

class GameController {
    // POST /games
    static async create(req, res) {
        const { title, genre, platform, rating, status } = req.body;

        let image = null;
        if (req.file) {
            image = `/images/games/${req.file.filename}`;
        }

        // Regra de negócio: Jogo "desejado" não pode ter avaliação
        if (status === 'desejado' && rating) {
            return res.status(422).json({ error: 'Você não pode avaliar um jogo que ainda está como desejado.' });
        }

        try {
            const game = await Game.create({
                title,
                genre,
                platform,
                rating: status === 'desejado' ? null : rating,
                status,
                image,
                userId: req.userId
            });

            return res.status(201).json({ message: 'Jogo cadastrado com sucesso!', game });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao cadastrar jogo.', details: error.message });
        }
    }

    // GET /games (Com suporte a filtros e busca avançada)
    static async getAll(req, res) {
        const { search, status, platform } = req.query;
        const where = {};

        if (search) {
            where.title = { [Op.like]: `%${search}%` };
        }
        if (status) {
            where.status = status;
        }
        if (platform) {
            where.platform = { [Op.like]: `%${platform}%` };
        }

        try {
            const games = await Game.findAll({
                where,
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(games);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar jogos.', details: error.message });
        }
    }

    // GET /games/user/mygames
    static async getMyGames(req, res) {
        try {
            const games = await Game.findAll({
                where: { userId: req.userId },
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json(games);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar seus jogos.' });
        }
    }

    // GET /games/:id
    static async getById(req, res) {
        const { id } = req.params;

        try {
            const game = await Game.findByPk(id, {
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            });

            if (!game) {
                return res.status(404).json({ error: 'Jogo não encontrado.' });
            }

            return res.status(200).json(game);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar jogo.' });
        }
    }

    // GET /games/export/excel
    static async exportToExcel(req, res) {
        try {
            const games = await Game.findAll({
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'email']
                },
                order: [['createdAt', 'DESC']]
            });

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'GameWish API';
            workbook.created = new Date();

            const worksheet = workbook.addWorksheet('Catálogo de Jogos');

            // Define colunas com largura e alinhamentos diretos
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 8, style: { alignment: { horizontal: 'center' } } },
                { header: 'Título do Jogo', key: 'title', width: 30 },
                { header: 'Gênero', key: 'genre', width: 20 },
                { header: 'Plataforma', key: 'platform', width: 20 },
                { header: 'Status', key: 'status', width: 16, style: { alignment: { horizontal: 'center' } } },
                { header: 'Nota', key: 'rating', width: 12, style: { alignment: { horizontal: 'center' } } },
                { header: 'Cadastrado Por', key: 'userName', width: 25 },
                { header: 'Email Usuário', key: 'userEmail', width: 30 },
                { header: 'Data de Cadastro', key: 'createdAt', width: 20, style: { alignment: { horizontal: 'center' } } }
            ];

            // Estilo da linha de cabeçalho (Linha 1)
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1E293B' }
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 24;

            // Adiciona as linhas
            games.forEach((game) => {
                worksheet.addRow({
                    id: game.id,
                    title: game.title,
                    genre: game.genre,
                    platform: game.platform,
                    status: game.status ? game.status.toUpperCase() : 'N/A',
                    rating: game.rating !== null && game.rating !== undefined ? game.rating : 'N/A',
                    userName: game.user ? game.user.name : 'Desconhecido',
                    userEmail: game.user ? game.user.email : 'N/A',
                    createdAt: new Date(game.createdAt).toLocaleDateString('pt-BR')
                });
            });

            // Configura os headers de download
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="relatorio_games.xlsx"'
            );

            await workbook.xlsx.write(res);
            return res.end();
        } catch (error) {
            console.error('ERRO AO EXPORTAR EXCEL:', error);
            return res.status(500).json({ error: 'Erro ao gerar planilha Excel.', details: error.message });
        }
    }

    // PUT /games/:id
    static async update(req, res) {
        const { id } = req.params;
        const { title, genre, platform, rating, status } = req.body;

        try {
            const game = await Game.findByPk(id);

            if (!game) {
                return res.status(404).json({ error: 'Jogo não encontrado.' });
            }

            // Regra de segurança: valida a posse do registro
            if (game.userId !== req.userId) {
                return res.status(403).json({ error: 'Você não tem permissão para editar este jogo.' });
            }

            // Regra de negócio: Jogo "desejado" não pode ter avaliação
            const currentStatus = status || game.status;
            if (currentStatus === 'desejado' && rating) {
                return res.status(422).json({ error: 'Você não pode avaliar um jogo que está como desejado.' });
            }

            // Se enviou imagem nova, atualiza o caminho; caso contrário, mantém a atual
            let image = game.image;
            if (req.file) {
                image = `/images/games/${req.file.filename}`;
            }

            await game.update({
                title,
                genre,
                platform,
                rating: currentStatus === 'desejado' ? null : rating,
                status,
                image
            });

            return res.status(200).json({
                message: 'Jogo atualizado com sucesso!',
                game
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar jogo.' });
        }
    }

    // DELETE /games/:id
    static async remove(req, res) {
        const { id } = req.params;

        try {
            const game = await Game.findByPk(id);

            if (!game) {
                return res.status(404).json({ error: 'Jogo não encontrado.' });
            }

            if (game.userId !== req.userId) {
                return res.status(403).json({ error: 'Você não tem permissão para excluir este jogo.' });
            }

            await game.destroy();

            return res.status(200).json({ message: 'Jogo removido com sucesso!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao excluir jogo.' });
        }
    }
}

module.exports = GameController;