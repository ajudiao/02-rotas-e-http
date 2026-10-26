import { config } from './src/config/database'


/* Knex precisa de saber qual é a configuração da base de dados para executar tarefas como criar migrations, executar migrations e fazer rollback. 
Exemplo: npx knex migrate:make create-users 
o Knex CLI procura a configuração do projeto, normalmente no knexfile.ts ou noutro ficheiro de configuração indicado explicitamente.
*/

export default config