-- CAVEFY | PostgreSQL
DROP TABLE IF EXISTS playlist_musicas CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS musicas CASCADE;
DROP TABLE IF EXISTS generos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  foto_url TEXT,
  papel VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (papel IN ('usuario', 'administrador')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE generos (id SERIAL PRIMARY KEY, nome VARCHAR(80) NOT NULL UNIQUE);

CREATE TABLE musicas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(140) NOT NULL,
  artista VARCHAR(120) NOT NULL,
  album VARCHAR(140),
  genero_id INTEGER NOT NULL REFERENCES generos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  ano INTEGER CHECK (ano IS NULL OR ano BETWEEN 1900 AND 2100),
  duracao_segundos INTEGER CHECK (duracao_segundos IS NULL OR duracao_segundos >= 0),
  descricao TEXT,
  capa_url TEXT,
  audio_url TEXT,
  criado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  descricao VARCHAR(240),
  capa_url TEXT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE playlist_musicas (
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  musica_id INTEGER NOT NULL REFERENCES musicas(id) ON DELETE CASCADE,
  adicionada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (playlist_id, musica_id)
);

CREATE INDEX musicas_titulo_idx ON musicas (LOWER(titulo));
CREATE INDEX musicas_artista_idx ON musicas (LOWER(artista));

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT;

INSERT INTO generos (nome) VALUES ('Rock'), ('Pop'), ('Eletrônica'), ('Hip Hop'), ('MPB'), ('Jazz'), ('Clássica'), ('Lo-fi') ON CONFLICT (nome) DO NOTHING;
