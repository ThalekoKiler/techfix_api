const OrdemServico = require('../models/ordemServico');

module.exports = class OrdemController {
    // POST /ordens/criar - Criação de uma nova ordem
    static async criar(req, res) {
        const { equipamento, defeitoRelatado, prioridade, valorOrcamento } = req.body;
        // O id do utilizador vem injetado pelo middleware verifyToken
        const usuarioId = req.user.id;

        // Remove acento se vier 'média' para casar com o ENUM do MySQL
        if (prioridade === 'média') {
            prioridade = 'media'
        }

        try {
            const novaOrdem = await OrdemServico.create({
                equipamento,
                defeitoRelatado,
                prioridade,
                valorOrcamento,
                usuarioId
            });

            return res.status(201).json({
                message: 'Ordem de serviço aberta com sucesso!',
                ordem: novaOrdem
            });
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno ao registrar ordem', error: error.message });
        }
    }

    // GET /ordens/minhas-ordens - Listagem das ordens
    static async listarMinhasOrdens(req, res) {
        try {
            // Garante a extração correta do ID do técnico vindo do token
            const usuarioId = req.user.id || req.user.userId;

            const ordens = await OrdemServico.findAll({
                where: { usuarioId: usuarioId },
                order: [['id', 'DESC']] // Ordena pelo ID primário (100% seguro contra erros de data)
            });

            return res.status(200).json({ ordens });
        } catch (error) {
            // Exibe o erro real no terminal do VS Code para diagnóstico
            console.error('--- ERRO DETALHADO DO SEQUELIZE EM LISTAR ORDENS ---');
            console.error(error);
            console.error('----------------------------------------------------');

            return res.status(500).json({
                message: 'Erro ao buscar ordens de serviço.',
                error: error.message
            });
        }
    }

    // PATCH /ordens/status/:id - Atualiza o andamento do chamado
    static async atualizarStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;

        try {
            // Assegurar que o técnico só edite os chamados sob sua responsabilidade
            const ordem = await OrdemServico.findOne({
                where: { id: id, usuarioId: req.user.id }
            });

            if (!ordem) {
                return res.status(404).json({ message: 'Ordem de serviço não encontrado!' });
            }

            ordem.status = status;
            await ordem.save();

            return res.status(200).json({
                message: 'Estado de ordem atualizado com sucesso!',
                ordem
            });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao atualizar o estado', error: error.message });
        }
    }

    // DELETE /ordens/:id - Excluir ordem de serviço 
    static async excluir(req, res) {
        const { id } = req.params;
        const usuarioId = req.user.id || req.user.userId;

        try {
            // Busca a ordem garantindo que ela pertence ao usuário autenticado
            const ordem = await OrdemServico.findOne({
                where: { id: id, usuarioId: usuarioId }
            });

            if (!ordem) {
                return res.status(404).json({
                    message: 'Ordem de serviço não encontrada ou você não tem permissão para excluí-la!'
                });
            }

            // Remover o registro do banco MySQL
            await ordem.destroy();

            return res.status(200).json({
                message: 'Ordem de serviço removida com sucesso!'
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Erro interno ao excluir a ordem',
                error: error.message
            });
        }
    }
};