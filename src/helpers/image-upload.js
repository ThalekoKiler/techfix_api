const multer = require('multer');
const path = require('path');

// Configurar onde e como salvar os arquivos
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/games');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const imageUpload = multer({
    storage: imageStorage,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('Por favor, envie apenas imagem PNG ou JPG!'));
        }
        cb(undefined, true);
    }
});

module.exports = imageUpload;