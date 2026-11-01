const router = require('express').Router();
const UserController = require('../controllers/userController');
const verifyToken = require('../helpers/verify-token');
const { registerValidation, loginValidation } = require('../helpers/validationHelper');

router.post('/register', registerValidation, UserController.register);
router.post('/login', loginValidation, UserController.login);
router.get('/estatisticas', verifyToken, UserController.getStats);
router.get('/me', verifyToken, UserController.checkUser);

module.exports = router;