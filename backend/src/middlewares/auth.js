import jwt from "jsonwebtoken";
import { env } from "../config/environment.js";
import pool from "../database/connection.js";

export async function autenticar(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ mensagem: "Faça login para continuar." });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const { rows } = await pool.query(
      "SELECT id, nome, email, papel, foto_url FROM usuarios WHERE id = $1",
      [payload.id],
    );
    if (!rows[0]) {
      return res.status(401).json({ mensagem: "Sessão inválida." });
    }
    req.usuario = rows[0];
    return next();
  } catch {
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
  }
}

export function somenteAdministrador(req, res, next) {
  if (req.usuario?.papel !== "administrador") {
    return res
      .status(403)
      .json({ mensagem: "Acesso permitido apenas para administradores." });
  }
  return next();
}
