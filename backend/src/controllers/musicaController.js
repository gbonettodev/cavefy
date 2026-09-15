import pool from "../database/connection.js";
import { musicaSchema } from "../validations/musica.js";

const campos = `m.id, m.titulo, m.artista, m.album, m.ano, m.duracao_segundos, m.descricao, m.capa_url, m.audio_url, m.criado_por, m.criado_em, g.id AS genero_id, g.nome AS genero`;
const urlDoArquivo = (req, file) =>
  file
    ? `${req.protocol}://${req.get("host")}/uploads/${file.fieldname === "audio" ? "audios" : "capas"}/${file.filename}`
    : null;
const buscar = (id) =>
  pool.query(
    `SELECT ${campos} FROM musicas m JOIN generos g ON g.id = m.genero_id WHERE m.id = $1`,
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
  if (!rows[0])
    return res.status(404).json({ mensagem: "Música não encontrada." });
  return res.json(rows[0]);
}
export async function criar(req, res) {
  const dados = musicaSchema.parse(req.body);
  const audio = req.files?.audio?.[0];
  const capa = req.files?.capa?.[0];
  const { rows } = await pool.query(
    "INSERT INTO musicas (titulo, artista, album, genero_id, ano, duracao_segundos, descricao, capa_url, audio_url, criado_por) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id",
    [
      dados.titulo,
      dados.artista,
      dados.album || null,
      dados.genero_id,
      dados.ano || null,
      dados.duracao_segundos || null,
      dados.descricao || null,
      urlDoArquivo(req, capa),
      urlDoArquivo(req, audio),
      req.usuario.id,
    ],
  );
  const musica = await buscar(rows[0].id);
  return res.status(201).json(musica.rows[0]);
}
export async function atualizar(req, res) {
  const dados = musicaSchema.parse(req.body);
  const existente = await pool.query(
    "SELECT criado_por, capa_url, audio_url FROM musicas WHERE id = $1",
    [req.params.id],
  );
  if (!existente.rows[0])
    return res.status(404).json({ mensagem: "Música não encontrada." });
  if (
    existente.rows[0].criado_por &&
    existente.rows[0].criado_por !== req.usuario.id &&
    req.usuario.papel !== "administrador"
  )
    return res
      .status(403)
      .json({ mensagem: "Você só pode editar músicas criadas por você." });
  const audio = req.files?.audio?.[0];
  const capa = req.files?.capa?.[0];
  const { rows } = await pool.query(
    "UPDATE musicas SET titulo=$1, artista=$2, album=$3, genero_id=$4, ano=$5, duracao_segundos=$6, descricao=$7, capa_url=$8, audio_url=$9, atualizado_em=NOW() WHERE id=$10 RETURNING id",
    [
      dados.titulo,
      dados.artista,
      dados.album || null,
      dados.genero_id,
      dados.ano || null,
      dados.duracao_segundos || null,
      dados.descricao || null,
      urlDoArquivo(req, capa) || existente.rows[0].capa_url,
      urlDoArquivo(req, audio) || existente.rows[0].audio_url,
      req.params.id,
    ],
  );
  const musica = await buscar(rows[0].id);
  return res.json(musica.rows[0]);
}
export async function remover(req, res) {
  const { rows } = await pool.query(
    "DELETE FROM musicas WHERE id = $1 RETURNING id",
    [req.params.id],
  );
  if (!rows[0])
    return res.status(404).json({ mensagem: "Música não encontrada." });
  return res.status(204).send();
}
