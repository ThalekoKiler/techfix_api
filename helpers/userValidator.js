const { body, validationResult } = require('express-validator');

// Regras de validação para cadastro
const userValidationRules = () => {
    return [
        body('nome')
            .notEmpty()
            .withMessage('O campo nome é obrigatório'),
        body('email')
            .notEmpty()
            .isEmail()
            .withMessage('Informe um email válido'),
        body('senha')
            .notEmpty()
            .isLength({ min: 6 })
            .withMessage('A senha deve conter no mínimo 6 caracteres'),
        body('telefone')
            .optional()
            .isString()
    ];
}

// Regras de validação para login
const loginValidationRules = () => {
    return [
        body('email')
            .notEmpty()
            .isEmail()
            .withMessage('Informe um email válido'),
        body('senha')
            .notEmpty()
            .withMessage('A senha é obrigatória')
    ];
}

// Middleware para barrar requisições inconsistentes com status 422
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(422).json({ message: errors.array()[0].msg });
}

module.exports = {
    userValidationRules,
    loginValidationRules,
    validate
};