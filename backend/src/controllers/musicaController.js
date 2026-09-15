import pool from "../database/connection.js";
import {
  fileReference,
  removeStoredFile,
  removeUploadedFiles,
} from "../services/fileStorage.js";
import { musicaSchema } from "../validations/musica.js";

const campos = `
  m.id,
  m.titulo,
  m.artista,
  m.album,
  m.ano,
  m.duracao_segundos,
  m.descricao,
  m.capa_url,
  m.audio_url,
  m.criado_por,
  m.criado_em,
  g.id AS genero_id,
  g.nome AS genero,
  COALESCE(
    (SELECT COUNT(*)::int FROM reproducoes r WHERE r.musica_id = m.id),
    0
  ) AS reproducoes
`;

const buscar = (id) =>
  pool.query(
    `
      SELECT ${campos}
      FROM musicas m
      JOIN generos g ON g.id = m.genero_id
      WHERE m.id = $1
    `,
    [id],
  );

export async function listar(req, res) {
  const { busca = "", genero } = req.query;
  const values = [];
  const filters = [];
  if (busca) {
    values.push(`%${busca}%`);
    filters.push(
      `(m.titulo ILIKE $${values.length} OR m.artista ILIKE $${values.length} OR COALESCE(m.album, '') ILIKE $${values.length})`,
    );
  }
  if (genero) {
    values.push(genero);
    filters.push(`m.genero_id = $${values.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT ${campos} FROM musicas m JOIN generos g ON g.id = m.genero_id ${where} ORDER BY m.criado_em DESC, m.id DESC`,
    values,
  );
  return res.json(rows);
}
export async function buscarPorId(req, res) {
  const { rows } = await buscar(req.params.id);
  if (!rows[0]) return res.status(404).json({ mensagem: "Música não encontrada." });
  return res.json(rows[0]);
}
export async function criar(req, res) {
  let persisted = false;
  try {
    const dados = musicaSchema.parse(req.body);
    const audio = req.files?.audio?.[0];
    const capa = req.files?.capa?.[0];
    const { rows } = await pool.query(
      `
        INSERT INTO musicas (
          titulo, artista, album, genero_id, ano, duracao_segundos,
          descricao, capa_url, audio_url, criado_por
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING id
      `,
      [
        dados.titulo,
        dados.artista,
        dados.album || null,
        dados.genero_id,
        dados.ano || null,
        dados.duracao_segundos || null,
        dados.descricao || null,
        fileReference(capa),
        fileReference(audio),
        req.usuario.id,
      ],
    );
    persisted = true;
    const musica = await buscar(rows[0].id);
    return res.status(201).json(musica.rows[0]);
  } catch (error) {
    if (!persisted) await removeUploadedFiles(req);
    throw error;
  }
}

export async function atualizar(req, res) {
  let persisted = false;
  try {
    const dados = musicaSchema.parse(req.body);
    const existente = await pool.query(
      "SELECT criado_por, capa_url, audio_url FROM musicas WHERE id = $1",
      [req.params.id],
    );
    const atual = existente.rows[0];

    if (!atual) {
      await removeUploadedFiles(req);
      return res.status(404).json({ mensagem: "Música não encontrada." });
    }

    if (
      atual.criado_por &&
      atual.criado_por !== req.usuario.id &&
      req.usuario.papel !== "administrador"
    ) {
      await removeUploadedFiles(req);
      return res
        .status(403)
        .json({ mensagem: "Você só pode editar músicas criadas por você." });
    }

    const audio = req.files?.audio?.[0];
    const capa = req.files?.capa?.[0];
    const { rows } = await pool.query(
      `
        UPDATE musicas
        SET
          titulo = $1,
          artista = $2,
          album = $3,
          genero_id = $4,
          ano = $5,
          duracao_segundos = $6,
          descricao = $7,
          capa_url = $8,
          audio_url = $9,
          atualizado_em = NOW()
        WHERE id = $10
        RETURNING id
      `,
      [
        dados.titulo,
        dados.artista,
        dados.album || null,
        dados.genero_id,
        dados.ano || null,
        dados.duracao_segundos || null,
        dados.descricao || null,
        fileReference(capa) || atual.capa_url,
        fileReference(audio) || atual.audio_url,
        req.params.id,
      ],
    );
    persisted = true;

    if (capa) await removeStoredFile(atual.capa_url);
    if (audio) await removeStoredFile(atual.audio_url);

    const musica = await buscar(rows[0].id);
    return res.json(musica.rows[0]);
  } catch (error) {
    if (!persisted) await removeUploadedFiles(req);
    throw error;
  }
}

export async function remover(req, res) {
  const { rows } = await pool.query(
    "DELETE FROM musicas WHERE id = $1 RETURNING id, capa_url, audio_url",
    [req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ mensagem: "Música não encontrada." });

  await Promise.all([
    removeStoredFile(rows[0].capa_url),
    removeStoredFile(rows[0].audio_url),
  ]);
  return res.status(204).send();
}

export async function registrarReproducao(req, res) {
  const { rows } = await pool.query(
    `
      INSERT INTO reproducoes (musica_id, usuario_id)
      SELECT id, $2 FROM musicas WHERE id = $1
      RETURNING id
    `,
    [req.params.id, req.usuario.id],
  );

  if (!rows[0]) {
    return res.status(404).json({ mensagem: "Música não encontrada." });
  }

  const total = await pool.query(
    "SELECT COUNT(*)::int AS reproducoes FROM reproducoes WHERE musica_id = $1",
    [req.params.id],
  );
  return res.status(201).json(total.rows[0]);
}
