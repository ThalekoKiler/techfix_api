const { DataTypes } = require('sequelize');
const conn = require('../db/conn');

// Mapear tabela 'usuarios' no MySQL via Sequelize
const User = conn.define('usuarios', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = User;