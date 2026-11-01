# 🎮 GameWish API

API RESTful desenvolvida em Node.js para gerenciamento de catálogo e lista de desejos de jogos, implementando arquitetura MVC, autenticação segura com JWT e ORM Sequelize integrado ao MySQL.

---

## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js
* **Framework Web:** Express
* **Banco de Dados:** MySQL
* **ORM:** Sequelize
* **Segurança:** bcryptjs (hashing de senhas) e jsonwebtoken (JWT)
* **Validação:** express-validator
* **Configuração:** dotenv e cors

---

## 📁 Estrutura do Projeto (Padrão MVC)

```text
gamewish-api/
├── public/                 # Interface estática de testes (HTML, CSS, JS)
├── src/
│   ├── config/             # Configuração e conexão do banco (Sequelize)
│   ├── controllers/        # Regras de negócio da aplicação
│   ├── helpers/            # Extração/validação de tokens e express-validator
│   ├── models/             # Esquemas de dados e relacionamentos
│   └── routes/             # Definição e mapeamento dos endpoints HTTP
├── .env                    # Variáveis de ambiente
├── app.js                  # Configuração global da aplicação Express
├── server.js               # Inicialização e conexão de rede
└── package.json
```

## ℹ️ Instalação e Execução:
1. Pré-requisitos:
- Node.js instalado
- Servidor MySQL ativo

2. Criar a base de dados: 
```sql
CREATE DATABASE IF NOT EXISTS gamewish_db;
```

3. Configurar as Variáveis de Ambiente:
Crie um arquivo .env na raiz do projeto com a seguinte estrutura:

```env
PORT=3000
DB_NAME=gamewish_db
DB_USER=root
DB_PASS=sua_senha_do_mysql
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql

JWT_SECRET=super_secret_key_123456
JWT_EXPIRES_IN=1d
```

4. Instalar Dependências e Inicializar:
```bash
# Instalação das dependências
npm install

# Execução em modo de desenvolvimento
npm run dev

# Execução em produção
npm start
```

- **Interface Web:** Acesse http://localhost:3000 no navegador
- **API Endpoints:** Use Insomnia, Postman ou cliente HTTP similar

## ℹ️ Documentação dos Endpoints:

### Autenticação e Usuários (/usuario):

| Método | Rota | Descrição | Autenticação |
| --- | --- | --- | --- |
| POST | /usuario/register | Cadastra novo usuário e retorna token JWT | Nenhuma |
| POST | /usuario/login | Realiza login e emite novo token JWT | Nenhuma |
| GET | /usuario/me | Retorna dados do perfil autenticado | Bearer Token |
| GET | /usuario/estatisticas | Retorna o total de jogos, status e média de notas do usuário autenticado | Bearer Token |

- Exemplo de Payload - Cadastro:

```json
{
    "name": "Paulo Silva",
    "email": "paulo@ex.com",
    "password": "senhaSegura123"
}
```
- Exemplo de Resposta de Sucesso (200 OK):
```json
{
    "message": "Autenticação realizada com sucesso!",
    "token": "eyJhbGciOiJTUz...",
    "userId": 1,
    "name": "Paulo Silva"
}
```

### Catálogo de Games (/games):

| Método | Rota | Descrição | Autenticação |
| --- | --- | --- | --- |
| GET | /games/export/excel | Gera e faz o download da planilha (.xlsx) com o catálogo completo | Nenhuma |
| GET | /games | Lista todos os jogos cadastrados na plataforma | Nenhuma |
| GET | /games/:id | Retorna os detalhes de um jogo específico | Nenhuma |
| GET | /games/user/mygames | Lista apenas os jogos vinculados ao usuário logado | Bearer Token |
| POST | /games | Cadastra um novo jogo | Bearer Token |
| PUT | /games/:id | Atualiza dados de um jogo (apenas proprietário) | Bearer Token |
| DELETE | /games/:id | Excluí um jogo do catálogo (apenas proprietário) | Bearer Token |

- Exemplo de Payload - Criação/Edição:

```json
{
    "title": "Elden Ring",
    "genre": "Action RPG / Soulslike",
    "platform": "PC",
    "rating": "9.8",
    "status": "jogando"
}
```

## Regras de Negócio e Segurança:

1. **Hashing de Senhas:** Senhas nunca são salvas em texto puro. O bcryptjs aplica algorítmo de 
hash com salt rounds antes de persistir ao banco
2. **Proteção por JWT:** Rotas protegidas utilizam cabeçalho HTTP "Authorization: Bearer <token>". 
O middleware "verify-token.js" valida assinatura, data de validade e injeta "req.userId" na requisição
3. **Validação Estrutural:** O express validator inspeciona os campos antes de atingir os controllers
4. **Isolamento de Recursos:** Um usuário autenticado possui permissão para editar ou excluir exclusivamente
jogos em que game.userId === req.userId, retornando status 403 Forbidden caso tente alterar registros de terceiros

## 🔄 Fluxo Arquitetural da Aplicação: 

```text
[ Cliente: Insomnia / Front-end ]
               │
               ▼  (HTTP Request: Headers, Bearer Token, Body)
     ┌──────────────────┐
     │      app.js      │  (CORS, express.json, Arquivos Estáticos)
     └─────────┬────────┘
               │
               ▼
     ┌──────────────────┐
     │      routes/     │  (/usuario, /games)
     └─────────┬────────┘
               │
               ▼
     ┌──────────────────┐
     │     helpers/     │
     │  - verify-token  │──> (Token inválido: retorna 401 Unauthorized)
     │  - validator     │──> (Campos inválidos: retorna 400 Bad Request)
     └─────────┬────────┘
               │
               ▼
     ┌──────────────────┐
     │   controllers/   │  (authController / gameController)
     └─────────┬────────┘
               │
               ▼
     ┌──────────────────┐
     │     models/      │  (User 1:N Game - Sequelize ORM)
     └─────────┬────────┘
               │
               ▼  (Queries SQL)
     ┌──────────────────┐
     │   Banco MySQL    │  (gamewish_db)
     └──────────────────┘
```
