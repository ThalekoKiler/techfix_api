const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./src/routes');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Rota para verificar a saúde da API
app.get('/health', (req, res) => {
    return res.status(200).json({ status: 'API online e funcionando!' });
});

// Agrupamento de todas as rotas da API
app.use(routes);

module.exports = app;