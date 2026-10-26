import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test" });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  PORT: z.coerce.number().int().min(1).default(3333),
  DATABASE_CLIENT: z.enum(["sqlite", "pg"]).default("sqlite"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Variáveis de ambiente inválidas:",
    z.treeifyError(parsed.error),
  );
  process.exit(1);
}

export const env = parsed.data;
