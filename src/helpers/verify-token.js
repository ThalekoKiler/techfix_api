const jwt = require('jsonwebtoken');
const getToken = require('./get-token');

const verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Acesso negado! Cabeçalho de autenticação ausente' });
    }

    const token = getToken(req);

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado! Token não informado' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Injetar os dados decodificados do usuário na requisição
        req.user = verified;
        req.userId = verified.id;

        next();
    } catch (err) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
    }
};

module.exports = verifyToken;