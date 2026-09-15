import pg from "pg";
import { env } from "../config/environment.js";

const { Pool } = pg;

const pool = new Pool({
  ...env.database,
  max: 10,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (error) => {
  console.error("Erro inesperado na conexão com o PostgreSQL:", error);
});

export default pool;
