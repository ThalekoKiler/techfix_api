const { DataTypes } = require('sequelize');
const conn = require('../db/conn');
const User = require('./Users');

// Mapear tabela 'ordens_servico'
const OrdemServico = conn.define('ordens_servico', {
    equipamento: {
        type: DataTypes.STRING,
        allowNull: false
    },
    defeitoRelatado: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    prioridade: {
        type: DataTypes.ENUM('baixa', 'media', 'alta'),
        defaultValue: 'media'
    },
    status: {
        type: DataTypes.ENUM('aberto', 'em_analise', 'concluido', 'cancelado'),
        defaultValue: 'aberto'
    },
    valorOrcamento: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
});

// Relacionamento: Uma ordem pertence a um técnico/usuário
OrdemServico.belongsTo(User, { foreignKey: 'usuarioId', allowNull: false });
User.hasMany(OrdemServico, { foreignKey: 'usuarioId' });

module.exports = OrdemServico;