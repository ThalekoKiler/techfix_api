require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Testar conn com banco
        await sequelize.authenticate();
        console.log('Conexão com o banco MySQL estabelecida com sucesso!');

        // Sincronizar tabelas do Sequelize com o banco
        await sequelize.sync();
        console.log('Tabelas sincronizadas com o banco!');

        // Iniciar o server
        app.listen(PORT, () => {
            console.log(`Servidor rodando em: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Falha ao conectar com banco de dados:', error.message);
        process.exit(1);
    }
}

startServer();