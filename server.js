require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conn = require('./db/conn');

// Models
require('./models/Users');
require('./models/ordemServico');

// Routes
const userRoutes = require('./routes/userRoutes');
const ordemRoutes = require('./routes/ordemRoutes');

const app = express();

// Middlewares globais
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Prefixos das rotas da API
app.use('/usuarios', userRoutes);
app.use('/ordens', ordemRoutes);

// Sincronização do Sequelize com o banco
const PORT = process.env.PORT || 3030;

conn.sync()
    .then(() => {
        console.log('Banco de dados MySQL conectado e tabelas sincronizadas!')
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}: http://localhost:${PORT}`)
        })
    })
    .catch((error) => {
        console.error('Falha ao conectar ou sincronizar o banco de dados:', error)
    })