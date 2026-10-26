# API de Transações

API REST desenvolvida como projeto de estudo para praticar **Node.js**, **Fastify** e **testes automatizados**. A aplicação permite criar e gerir transações financeiras, usando **SQLite** para persistir os dados e cookies para associar as transações à sessão de cada usuário.

> Este projeto tem fins exclusivamente educativos e não se destina a uso em produção.

## Funcionalidades

- Criar transações de crédito e débito.
- Consultar o saldo e listar as transações da sessão atual.
- Consultar, atualizar e remover uma transação.
- Manter as transações isoladas por sessão, identificada por cookie.
- Validar os dados recebidos pela API.

## Tecnologias

- Node.js e TypeScript
- Fastify
- SQLite e Knex
- Zod
- Vitest e Supertest

## Requisitos

- Node.js e npm instalados.

## Como executar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env` a partir do exemplo:

   ```bash
   cp .env.exemple .env
   ```

   O exemplo configura o SQLite em `./db/app.db` e a aplicação na porta `3333`. Ajuste as variáveis em `.env` se necessário.

3. Execute as migrations para criar a estrutura da base de dados:

   ```bash
   npm run knex -- migrate:latest
   ```

4. Inicie a aplicação em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

A API ficará disponível em `http://localhost:3333`.

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Rota de teste |
| `POST` | `/transactions` | Cria uma transação |
| `GET` | `/transactions` | Lista as transações da sessão |
| `GET` | `/transactions/summary` | Consulta o saldo da sessão |
| `GET` | `/transactions/:id` | Consulta uma transação |
| `PUT` | `/transactions/:id` | Atualiza uma transação |
| `DELETE` | `/transactions/:id` | Remove uma transação |

Para criar ou atualizar uma transação, envie um JSON com `title`, `amount` e `type`. O tipo deve ser `credit` ou `debit`. A API define a sessão através de um cookie devolvido na criação da primeira transação; envie esse cookie nas consultas e alterações seguintes.

## Testes e build

Execute os testes uma vez:

```bash
npm test -- --run
```

Os testes usam as configurações de `.env.test` e a base de dados `./db/test.db`.

Para compilar o projeto:

```bash
npm run build
```

Para iniciar a versão compilada:

```bash
npm start
```
