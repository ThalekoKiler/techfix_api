const router = require('express').Router();
const UserController = require('../controllers/userController');
const verifyToken = require('../helpers/verify-token');
const { userValidationRules, loginValidationRules, validate } = require('../helpers/userValidator');

// Rotas públicas de cadastro e autenticação
router.post('/register', userValidationRules(), validate, UserController.register);
router.post('/login', loginValidationRules(), validate, UserController.login);
router.get('/checkuser', verifyToken, UserController.checkUser);
router.patch('/edit', verifyToken, UserController.editUser);
router.delete('/delete-my-account', verifyToken, UserController.deleteAccount);

module.exports = router;