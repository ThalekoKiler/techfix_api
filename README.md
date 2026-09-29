# 🛠️ TechFix API - Sistema de Gestão de Ordens de Serviço

API RESTful completa desenvolvida em Node.js e Express para controlo de atendimentos, técnicos e ordens de serviço de assistência técnica. O projeto conta com persistência em base de dados relacional (MySQL via Sequelize), arquitetura MVC, autenticação stateless via JWT e interface web integrada.

---

## 🚀 Tecnologias Utilizadas

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework Web:** [Express.js](https://expressjs.com/)
- **ORM & Base de Dados:** [Sequelize](https://sequelize.org/) e [MySQL](https://www.mysql.com/)
- **Segurança & Criptografia:** [bcrypt](https://www.npmjs.com/package/bcrypt) e [jsonwebtoken (JWT)](https://jwt.io/)
- **Validação de Dados:** [express-validator](https://express-validator.github.io/docs/)
- **Variáveis de Ambiente:** [dotenv](https://www.npmjs.com/package/dotenv)
- **Frontend:** HTML5, CSS3 moderno e Vanilla JavaScript (Fetch API)

---

## 📂 Arquitetura da Solução

O projeto segue a arquitetura em camadas **MVC (Model-View-Controller)** com separação rigorosa de responsabilidades:

```text
techfix_api/
├── controllers/          # Regras de negócio da aplicação
│   ├── ordemController.js
│   └── userController.js
├── db/                   # Configuração e inicialização da base de dados
│   └── conn.js
├── helpers/              # Middlewares de validação e auxiliares de autenticação
│   ├── create-user-token.js
│   ├── get-token.js
│   ├── ordemValidator.js
│   ├── userValidator.js
│   └── verify-token.js
├── models/               # Modelos relacionais do Sequelize
│   ├── OrdemServico.js
│   └── Users.js
├── public/               # Interface Web estática integrada
│   └── index.html
├── routes/               # Definição e proteção de endpoints REST
│   ├── ordemRoutes.js
│   └── userRoutes.js
├── .env.example          # Exemplo de configuração de variáveis de ambiente
├── .gitignore            # Ficheiros ignorados pelo Git
├── package.json          # Metadados e dependências do projeto
├── README.md             # Documentação técnica do sistema
└── server.js             # Ponto de entrada e sincronização da aplicação

---

## 👥 Integrantes do Grupo:

- Thales Vasconcellos Tardelli Sabbag de Paula
- Matheus Barrense Mendes dos Santos
- Gabriel Henrique Sartório
