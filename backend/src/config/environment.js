import dotenv from "dotenv";

dotenv.config();

const production = process.env.NODE_ENV === "production";
const jwtSecret =
  process.env.JWT_SECRET || (production ? "" : "cavefy-development-secret-change-me");

if (!jwtSecret) {
  throw new Error("JWT_SECRET precisa ser definido em produção.");
}

if (!process.env.JWT_SECRET && !production) {
  console.warn(
    "Aviso: JWT_SECRET não foi configurado. Usando segredo apenas para desenvolvimento.",
  );
}

const frontendOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = Object.freeze({
  production,
  port: Number(process.env.PORT) || 3001,
  jwtSecret,
  frontendOrigins,
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:
      process.env.DB_SSL === "true"
        ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
        : undefined,
  },
});
