const jwt = require('jsonwebtoken');
const getToken = require('./get-token');
require('dotenv').config();

// Middleware para validação do JWT nas rotas protegidas
const verifyToken = (req, res, next) => {
    // Verificar o cabeçalho Authorization
    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Acesso Negado: Caebeçalho de autorização ausente! ' });
    }

    const token = getToken(req);

    // Verificar a hash do token
    if (!token) {
        return res.status(401).json({ message: 'Acesso Negado: Token não fornecido!' });
    }

    try {
        // Validar a assinatura e integriade do token usando o segredo
        const verified = jwt.verify(token, process.env.CHAVETOKEN);
        req.user = verified; // Injetar os dados decodificados na requisição
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Acesso Negado: Token inválido ou expirado!', details: error.message });
    }
}

module.exports = verifyToken;