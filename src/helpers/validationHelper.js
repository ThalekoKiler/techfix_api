const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map((err) => ({
                campo: err.path,
                mensagem: err.msg
            }))
        });
    }
    return next();
};

const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('O nome é obrigatório!')
        .isLength({ min: 3 }).withMessage('O nome deve ter pelo menos 3 caracteres'),
    body('email')
        .trim()
        .notEmpty().withMessage('O email é obrigatório!')
        .isEmail().withMessage('Informe um email válido!')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('A senha é obrigatória!')
        .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
    validate
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('O e-mail é obrigatório!')
        .isEmail().withMessage('Informe um e-mail válido!')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('A senha é obrigatória!'),
    validate
];

const gameValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('O título do jogo é obrigatório!')
        .isLength({ min: 2 }).withMessage('O título deve ter no mínimo 2 caracteres!'),
    body('genre')
        .trim()
        .notEmpty().withMessage('O gênero é obrigatório!'),
    body('platform')
        .trim()
        .notEmpty().withMessage('A plataforma é obrigatória (ex: PC, PS5, Xbox, Switch).'),
    body('rating')
        .optional()
        .isFloat({ min: 0, max: 10 }).withMessage('A nota deve ser um número entre 0 e 10!'),
    body('status')
        .optional()
        .isIn(['desejado', 'jogando', 'concluido', 'abandonado'])
        .withMessage('Status inválido. Use: desejado, jogando, concluido ou abandonado.'),
    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    gameValidation
};

