import pool from "../database/connection.js";
import {
  fileReference,
  removeStoredFile,
  removeUploadedFiles,
} from "../services/fileStorage.js";
import { playlistSchema } from "../validations/musica.js";

const listQuery = `
  SELECT
    p.id,
    p.nome,
    p.descricao,
    p.capa_url,
    p.criada_em,
    COUNT(pm.musica_id)::int AS total_musicas
  FROM playlists p
  LEFT JOIN playlist_musicas pm ON pm.playlist_id = p.id
  WHERE p.usuario_id = $1
  GROUP BY p.id
  ORDER BY p.criada_em DESC
`;

export async function listar(req, res) {
  const { rows } = await pool.query(listQuery, [req.usuario.id]);
  return res.json(rows);
}

export async function detalhes(req, res) {
  const playlist = await pool.query(
    `
      SELECT id, nome, descricao, capa_url, criada_em
      FROM playlists
      WHERE id = $1 AND usuario_id = $2
    `,
    [req.params.id, req.usuario.id],
  );

  if (!playlist.rows[0]) {
    return res.status(404).json({ mensagem: "Playlist não encontrada." });
  }

  const musicas = await pool.query(
    `
      SELECT
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
        g.id AS genero_id,
        g.nome AS genero,
        COALESCE(
          (SELECT COUNT(*)::int FROM reproducoes r WHERE r.musica_id = m.id),
          0
        ) AS reproducoes
      FROM playlist_musicas pm
      JOIN musicas m ON m.id = pm.musica_id
      JOIN generos g ON g.id = m.genero_id
      WHERE pm.playlist_id = $1
      ORDER BY pm.adicionada_em ASC
    `,
    [req.params.id],
  );

  return res.json({
    ...playlist.rows[0],
    total_musicas: musicas.rows.length,
    musicas: musicas.rows,
  });
}

export async function criar(req, res) {
  let persisted = false;
  try {
    const dados = playlistSchema.parse(req.body);
    const { rows } = await pool.query(
      `
        INSERT INTO playlists (nome, descricao, capa_url, usuario_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nome, descricao, capa_url, criada_em
      `,
      [dados.nome, dados.descricao || null, fileReference(req.file), req.usuario.id],
    );
    persisted = true;
    return res.status(201).json({ ...rows[0], total_musicas: 0 });
  } catch (error) {
    if (!persisted) await removeUploadedFiles(req);
    throw error;
  }
}

export async function atualizar(req, res) {
  let persisted = false;
  try {
    const dados = playlistSchema.parse(req.body);
    const existente = await pool.query(
      `
        SELECT capa_url
        FROM playlists
        WHERE id = $1 AND usuario_id = $2
      `,
      [req.params.id, req.usuario.id],
    );
    const atual = existente.rows[0];

    if (!atual) {
      await removeUploadedFiles(req);
      return res.status(404).json({ mensagem: "Playlist não encontrada." });
    }

    const capa = fileReference(req.file);
    const { rows } = await pool.query(
      `
        UPDATE playlists
        SET nome = $1, descricao = $2, capa_url = COALESCE($3, capa_url)
        WHERE id = $4 AND usuario_id = $5
        RETURNING id, nome, descricao, capa_url, criada_em
      `,
      [dados.nome, dados.descricao || null, capa, req.params.id, req.usuario.id],
    );
    persisted = true;

    if (capa) await removeStoredFile(atual.capa_url);
    return res.json(rows[0]);
  } catch (error) {
    if (!persisted) await removeUploadedFiles(req);
    throw error;
  }
}

export async function remover(req, res) {
  const { rows } = await pool.query(
    `
      DELETE FROM playlists
      WHERE id = $1 AND usuario_id = $2
      RETURNING capa_url
    `,
    [req.params.id, req.usuario.id],
  );

  if (!rows[0]) {
    return res.status(404).json({ mensagem: "Playlist não encontrada." });
  }

  await removeStoredFile(rows[0].capa_url);
  return res.status(204).send();
}

export async function adicionarMusica(req, res) {
  const playlist = await pool.query(
    "SELECT 1 FROM playlists WHERE id = $1 AND usuario_id = $2",
    [req.params.id, req.usuario.id],
  );
  if (!playlist.rowCount) {
    return res.status(404).json({ mensagem: "Playlist não encontrada." });
  }

  const musica = await pool.query("SELECT 1 FROM musicas WHERE id = $1", [
    req.params.musicaId,
  ]);
  if (!musica.rowCount) {
    return res.status(404).json({ mensagem: "Música não encontrada." });
  }

  const { rowCount } = await pool.query(
    `
      INSERT INTO playlist_musicas (playlist_id, musica_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `,
    [req.params.id, req.params.musicaId],
  );
  if (!rowCount) {
    return res.status(409).json({ mensagem: "Esta música já está na playlist." });
  }
  return res.status(204).send();
}

export async function removerMusica(req, res) {
  const { rowCount } = await pool.query(
    `
      DELETE FROM playlist_musicas pm
      USING playlists p
      WHERE
        pm.playlist_id = p.id
        AND pm.playlist_id = $1
        AND pm.musica_id = $2
        AND p.usuario_id = $3
    `,
    [req.params.id, req.params.musicaId, req.usuario.id],
  );

  if (!rowCount) {
    return res.status(404).json({ mensagem: "Música não encontrada nesta playlist." });
  }
  return res.status(204).send();
}
