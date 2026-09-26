// Função cujo foco é extrair apenas a hash do token do Header HTTP
const getToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    // O header vem no formato "Bearer <token>", o foco é pegar a segunda parte ´´
    const token = authHeader.split(' ')[1];
    return token;
}

module.exports = getToken;