
import knexPackage, { type Knex } from "knex";
import { env } from "./env.js";

const isProduction = env.NODE_ENV === "production";
const isSQLite = env.DATABASE_CLIENT === "sqlite";

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,

  connection: isSQLite
    ? {
        filename: env.DATABASE_URL,
      }
    : {
        connectionString: env.DATABASE_URL,
        ...(isProduction && {
          ssl: { rejectUnauthorized: false },
        }),
      },

  useNullAsDefault: isSQLite,

  migrations: {
    directory: "./db/migrations",
    extension: "ts",
  },
};

export const knex = knexPackage(config);
