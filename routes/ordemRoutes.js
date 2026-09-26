const router = require('express').Router();
const OrdemController = require('../controllers/ordemController');
const verifyToken = require('../helpers/verify-token');
const { ordemValidationRules, validate } = require('../helpers/orderValidator');

// Todas as rotas abaixo irão requerer o cabeçalho Authorization com JWT válido
router.post('/criar', verifyToken, ordemValidationRules(), validate, OrdemController.criar);
router.get('/minhas-ordens', verifyToken, OrdemController.listarMinhasOrdens);
router.patch('/status/:id', verifyToken, OrdemController.atualizarStatus);
router.delete('/:id', verifyToken, OrdemController.excluir);

module.exports = router;