import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { execSync } from "node:child_process";
import { app } from "../src/app.js";

describe("Transactions Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(() => {
    execSync("npm run knex -- migrate:rollback --all", {
      stdio: "inherit",
    });

    execSync("npm run knex -- migrate:latest", {
      stdio: "inherit",
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to create a transaction", async () => {
    const response = await request(app.server).post("/transactions").send({
      title: "New transaction",
      amount: 121121,
      type: "credit",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
      }),
    );
  });

  it.skip("should be able to list transactions", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 121121,
        type: "credit",
      })
      .expect(201);

    const cookies = createTransactionResponse.headers["set-cookie"];

    if (!cookies) {
      throw new Error("The server did not return the expected cookie.");
    }

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "New transaction",
          amount: 121121,
        }),
      ]),
    );
  });

  it.skip("should be able to get a specific transaction", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Get Transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);

    const cookies = createTransactionResponse.headers["set-cookie"];
    const { id } = createTransactionResponse.body;

    if (!cookies || !id) {
      throw new Error("Cookie ou ID da transação não foi devolvido.");
    }

    const transactionResponse = await request(app.server)
      .get(`/transactions/${id}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(transactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "Get Transaction",
        amount: 5000,
      }),
    );
  });

  it.skip("should be able to delete a transaction", async () => {
    const createResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Transaction to delete",
        amount: 5000,
        type: "credit",
      })
      .expect(201);

    const { id } = createResponse.body;
    const cookies = createResponse.headers["set-cookie"];

    if (!id) {
      throw new Error("The server did not return the expected transaction ID.");
    }

    if (!cookies) {
      throw new Error("The server did not return the expected cookie.");
    }

    await request(app.server)
      .delete(`/transactions/${id}`)
      .set("Cookie", cookies)
      .expect(204);

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionsResponse.body.transactions).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id })]),
    );
  });

  it.skip("should be able to get the summary", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Credit transaction",
        amount: 3000,
        type: "credit",
      });

    const cookies = createTransactionResponse.headers["set-cookie"];

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "Debit transaction",
        amount: 500,
        type: "debit",
      });

    if (!cookies) {
      throw new Error("The server did not return the expected cookie.");
    }

    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({
      amount: 2500,
    });
  });

  it("should be able to update a transaction", async () => {
    const response = await request(app.server).post("/transactions").send({
      title: "New transaction",
      amount: 500,
      type: "credit",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
      }),
    );

    const { id } = response.body;
    const cookies = response.headers["set-cookie"];
    await request(app.server).get(`/transactions/${id}`).set("Cookie", cookies).expect(200);

    const newTransaction = {
      title: "Update transaction",
      amount: 1000,
      type: "debit",
    };

    const updatedTransaction = await request(app.server)
      .put(`/transactions/${id}`)
      .set("Cookie", cookies)
      .send(newTransaction);

    expect(updatedTransaction.statusCode).toBe(200)
  });
});
