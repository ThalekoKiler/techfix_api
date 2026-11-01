const router = require('express').Router();
const GameController = require('../controllers/gameController');
const verifyToken = require('../helpers/verify-token');
const { gameValidation } = require('../helpers/validationHelper');
const imageUpload = require('../helpers/image-upload');

// Rota de exportação Excel
router.get('/export/excel', GameController.exportToExcel);

// Rotas públicas
router.get('/', GameController.getAll);
router.get('/:id', GameController.getById);

// Rotas protegidas
router.get('/user/mygames', verifyToken, GameController.getMyGames);
router.post('/', verifyToken, imageUpload.single('image'), gameValidation, GameController.create);
router.put('/:id', verifyToken, imageUpload.single('image'), gameValidation, GameController.update);
router.delete('/:id', verifyToken, GameController.remove);

module.exports = router;