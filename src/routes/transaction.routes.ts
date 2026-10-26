import type { FastifyInstance } from "fastify";
import { knex } from "../config/database.js";
import { randomUUID } from "crypto";
import {
  createTransactionSchema,
  getTransactionParamsSchema,
} from "../validators/transaction.js";
import { checkSessionExists } from "../middlewares/check-session-id-exists.js";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    "/transactions",
    { preHandler: [checkSessionExists] },
    async (request) => {
      const { sessionId } = request.cookies;

      const transactions = await knex("transactions")
        .where("session_id", sessionId)
        .select("*");

      return { transactions };
    },
  );
  app.post("/transactions", async (request, reply) => {
    const validation = createTransactionSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.status(400).send({
        message: "Dados inválidos.",
        error: validation.error.issues,
      });
    }

    const { title, amount, type } = validation.data;
    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
      });
    }

    const transaction = {
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : -amount,
      session_id: sessionId,
    };

    await knex("transactions").insert(transaction);
    return reply.status(201).send(transaction);
  });

  app.get(
    "/transactions/:id",
    { preHandler: [checkSessionExists] },
    async (request, reply) => {
      const validation = getTransactionParamsSchema.safeParse(request.params);

      if (!validation.success) {
        return reply.status(401).send({
          message: "Paramétro inválido",
          error: validation.error.issues,
        });
      }

      const { id } = validation.data;
      const { sessionId } = request.cookies;
      const transaction = await knex("transactions")
        .where("id", id)
        .andWhere("session_id", sessionId)
        .first();

      if (!transaction)
        return reply.status(404).send({ message: "Transação não encontrada." });
      return { transaction };
    },
  );

  app.get(
    "/transactions/summary",
    { preHandler: [checkSessionExists] },
    async (request) => {
      const { sessionId } = request.cookies;
      const summary = await knex("transactions")
        .where("session_id", sessionId)
        .sum("amount", { as: "amount" })
        .first();

      return { summary: { amount: summary?.amount ?? 0 } };
    },
  );

  app.delete(
    "/transactions/:id",
    { preHandler: [checkSessionExists] },
    async (request, reply) => {
      const validation = getTransactionParamsSchema.safeParse(request.params);

      if (!validation.success) {
        return reply.status(401).send({
          message: "Paramétro inválido",
          error: validation.error.issues,
        });
      }

      const { sessionId } = request.cookies;

      const { id } = validation.data;
      const transactionDeleted = await knex("transactions")
        .where({ id })
        .andWhere("session_id", sessionId)
        .del();

      if (transactionDeleted === 0) {
        return reply.status(404).send({
          message: "Transação não encontrada",
        });
      }

      return reply.status(204).send();
    },
  );

  app.put(
    "/transactions/:id",
    { preHandler: [checkSessionExists] },
    async (request, reply) => {
      const paramsResult = getTransactionParamsSchema.safeParse(request.params);

      if (!paramsResult.success) {
        return reply.status(400).send({
          message: "Parâmetros inválidos.",
          errors: paramsResult.error.issues,
        });
      }

      const bodyResult = createTransactionSchema.safeParse(request.body);

      if (!bodyResult.success) {
        return reply.status(400).send({
          message: "Dados da transação inválidos.",
          errors: bodyResult.error.issues,
        });
      }

      const { id } = paramsResult.data;
      const { title, amount, type } = bodyResult.data;
      const { sessionId } = request.cookies;

      const updatedTransaction = {
        title,
        amount: type === "credit" ? amount : -amount,
      };

      const [transaction] = await knex("transactions")
        .where({
          id,
          session_id: sessionId,
        })
        .update(updatedTransaction)
        .returning("*");

      if (!transaction) {
        return reply.status(404).send({
          message: "Transação não encontrada.",
        });
      }

      return reply.status(200).send({
        transaction,
      });
    },
  );
}
