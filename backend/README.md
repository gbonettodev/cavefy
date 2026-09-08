# CAVEFY API

API REST Node.js + Express + PostgreSQL para o catálogo musical CAVEFY.

## Configuração

1. Crie um banco PostgreSQL chamado `cavefy`.
2. Execute [`database.sql`](./database.sql).
3. Copie `.env.example` para `.env` e ajuste as credenciais.
4. Instale e execute:

```powershell
npm install
npm run dev
```

## Rotas

- `/api/auth`: cadastro, login e sessão JWT;
- `/api/musicas`: CRUD protegido com upload de `capa` e `audio`;
- `/api/generos`: listagem para usuários e criação restrita a administradores;
- `/api/playlists`: CRUD e associação de músicas;
- `/uploads`: arquivos enviados pelo usuário;
- `/health`: verificação da API.

O limite de upload é 25 MB. Áudios aceitos: MP3, WAV e OGG. Capas aceitas: JPG, PNG e WEBP.
