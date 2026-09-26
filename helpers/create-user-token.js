const jwt = require('jsonwebtoken');
require('dotenv').config();

// Emitiremos um token JWT com ID, nome no payload assinado
const createUserToken = async (user, req, res) => {
    const token = jwt.sign(
        {
            name: user.nome,
            id: user.id
        },
        process.env.CHAVETOKEN,
        { expiresIn: '8h' } // Por medidas de segurança o Token JWT irá ter um tempo limite
    );

    return res.status(200).json({
        message: 'Autenticado com sucesso!',
        token: token,
        userId: user.id
    });
}

module.exports = createUserToken;