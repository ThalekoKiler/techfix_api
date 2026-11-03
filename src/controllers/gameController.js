const { Op } = require('sequelize');
const { Game, User, sequelize } = require('../models');
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
        const { search, platform, genre } = req.query;
        const where = {};

        if (search) {
            where.title = { [Op.like]: `%${search}%` };
        }
        if (platform) {
            where.platform = { [Op.like]: `%${platform}%` };
        }
        if (genre) {
            where.genre = { [Op.like]: `%${genre}%` };
        }

        try {
            const games = await Game.findAll({
                where,
                attributes: [
                    // Normaliza o título eliminando espaços nas pontas para agrupar sem falhas
                    [sequelize.fn('TRIM', sequelize.col('title')), 'title'],
                    [sequelize.fn('MAX', sequelize.col('genre')), 'genre'],
                    [sequelize.fn('MAX', sequelize.col('platform')), 'platform'],
                    [sequelize.fn('MAX', sequelize.col('image')), 'image'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalUsers'],
                    [
                        sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('rating')), 1),
                        'averageRating'
                    ]
                ],
                // Agrupa estritamente pelo título limpo
                group: [sequelize.fn('TRIM', sequelize.col('title'))],
                order: [[sequelize.fn('AVG', sequelize.col('rating')), 'DESC']]
            });

            return res.status(200).json(games);
        } catch (error) {
            console.error('ERRO AO BUSCAR JOGOS UNIFICADOS:', error);
            return res.status(500).json({ error: 'Erro ao listar catálogo unificado.', details: error.message });
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
                attributes: [
                    [sequelize.fn('TRIM', sequelize.col('title')), 'title'],
                    [sequelize.fn('MAX', sequelize.col('genre')), 'genre'],
                    [sequelize.fn('MAX', sequelize.col('platform')), 'platform'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalUsers'],
                    [
                        sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('rating')), 1),
                        'averageRating'
                    ]
                ],
                group: [sequelize.fn('TRIM', sequelize.col('title'))],
                order: [[sequelize.fn('AVG', sequelize.col('rating')), 'DESC']]
            });

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'GameWish API';
            workbook.created = new Date();

            const worksheet = workbook.addWorksheet('Catálogo Comunitário');

            // Configuração das colunas
            worksheet.columns = [
                { header: 'Título do Jogo', key: 'title', width: 32 },
                { header: 'Gênero', key: 'genre', width: 22 },
                { header: 'Plataforma', key: 'platform', width: 22 },
                { header: 'Média de Nota', key: 'averageRating', width: 16, style: { alignment: { horizontal: 'center' } } },
                { header: 'Qtd. Avaliações', key: 'totalUsers', width: 16, style: { alignment: { horizontal: 'center' } } }
            ];

            // Cabeçalho estilizado
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1E293B' }
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 24;

            // Adicionando os registros
            games.forEach((game) => {
                const item = game.dataValues || game;

                worksheet.addRow({
                    title: item.title,
                    genre: item.genre || 'N/A',
                    platform: item.platform || 'N/A',
                    averageRating: item.averageRating !== null && item.averageRating !== undefined ? item.averageRating : 'Sem avaliações',
                    totalUsers: item.totalUsers
                });
            });

            // Configuração dos cabeçalhos HTTP para download
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="catalogo_comunitario_games.xlsx"'
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