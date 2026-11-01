const sequelize = require('../config/database');
const User = require('./User');
const Game = require('./Game');

// Relacionar: 1 Usuário tem muitos Games
User.hasMany(Game, { foreignKey: 'userId', as: 'games', onDelete: 'CASCADE' });
Game.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
    sequelize,
    User,
    Game
};