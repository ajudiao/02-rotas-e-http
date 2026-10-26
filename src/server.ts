import { app } from "./app.js";
import { env } from "./config/env.js";


app.listen({
  port: env.PORT,
}).then(() => {
  console.log(`HTTP server running on port ${env.PORT}`);
});