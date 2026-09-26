const { body, validationResult } = require('express-validator');

// Regras de validação para a abertura de ordens de serviço
const ordemValidationRules = () => {
    return [
        body('equipamento')
            .notEmpty()
            .withMessage('O equipamento é obrigatório'),
        body('defeitoRelatado')
            .notEmpty()
            .withMessage('A descrição do defeito é obrigatória'),
        body('prioridade')
            .optional()
            .customSanitizer(val => val ? val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : val)
            .isIn(['baixa', 'media', 'alta'])
            .withMessage('A prioridade deve ser: baixa, media ou alta')
    ];
};

// Middleware para barrar requisições inconsistentes
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(422).json({ message: errors.array()[0].msg });
};

module.exports = {
    ordemValidationRules,
    validate
};