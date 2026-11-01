const getToken = (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return null;
    }

    // Divide "Bearer <token>" em array e pega o segundo item
    const token = authHeader.split(' ')[1];

    return token;
};

module.exports = getToken;