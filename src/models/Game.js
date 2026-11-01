const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Game = sequelize.define('Game', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(120),
        allowNull: false
    },
    genre: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    platform: {
        type: DataTypes.STRING(80),
        allowNull: false
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
            min: 0,
            max: 10
        }
    },
    status: {
        type: DataTypes.ENUM('desejado', 'jogando', 'concluido', 'abandonado'),
        defaultValue: 'desejado'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'games',
    timestamps: true
});

module.exports = Game;