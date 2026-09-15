import pool from "./connection.js";

export async function ensureRuntimeSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reproducoes (
      id BIGSERIAL PRIMARY KEY,
      musica_id INTEGER NOT NULL REFERENCES musicas(id) ON DELETE CASCADE,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      reproduzida_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS reproducoes_musica_idx
      ON reproducoes (musica_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS reproducoes_usuario_idx
      ON reproducoes (usuario_id)
  `);
}
