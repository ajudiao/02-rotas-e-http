import fastify from "fastify";
import cookies from "@fastify/cookie";
import { env } from "./config/env.js";
import { transactionsRoutes } from "./routes/transaction.routes.js";
import { knex } from "./config/database.js";

export const app = fastify();

app.register(cookies);
app.register(transactionsRoutes);

app.addHook("onClose", async () => {
  await knex.destroy();
});

app.get('/', (request, reply) => {
  return reply.status(200).send({
    message: "Rota de teste"
  })
})