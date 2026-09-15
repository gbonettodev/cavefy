import app from "./app.js";
import { env } from "./config/environment.js";
import pool from "./database/connection.js";
import { ensureRuntimeSchema } from "./database/schema.js";

async function start() {
  await ensureRuntimeSchema();
  const server = app.listen(env.port, () => {
    console.log(`CAVEFY API rodando em http://localhost:${env.port}`);
  });

  server.on("error", async (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `A porta ${env.port} já está em uso. Encerre a API antiga e tente novamente.`,
      );
    } else {
      console.error("Erro ao iniciar o servidor HTTP:", error);
    }
    await pool.end();
    process.exit(1);
  });

  async function shutdown(signal) {
    console.log(`${signal} recebido. Encerrando a API...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch(async (error) => {
  console.error("Não foi possível iniciar a API:", error);
  await pool.end();
  process.exit(1);
});
