require('dotenv').config();
const jwt = require('jsonwebtoken');

const createUserToken = async (user, req, res) => {
    // Criar token JWT
    const token = jwt.sign(
        {
            id: user.id,
            name: user.name
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        }
    );

    // Retornará a resposta ao cliente com status 200
    return res.status(200).json({
        message: 'Autenticação realizada com sucesso!',
        token: token,
        userId: user.id
    });
};

module.exports = createUserToken;