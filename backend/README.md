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
- `/api/musicas/:id/reproducoes`: persistência das reproduções;
- `/api/generos`: listagem para usuários e criação restrita a administradores;
- `/api/playlists`: CRUD e associação de músicas;
- `/uploads`: arquivos enviados pelo usuário;
- `/health`: verificação da API.

O limite de upload é 25 MB. Áudios aceitos: MP3, WAV e OGG. Capas aceitas: JPG, PNG e WEBP.

## Segurança e manutenção

- Helmet adiciona cabeçalhos de segurança;
- CORS aceita somente as origens configuradas em `FRONTEND_URL`;
- as rotas de autenticação possuem limite de tentativas;
- erros internos não expõem detalhes do PostgreSQL;
- mídias substituídas ou excluídas são removidas automaticamente.

Comandos úteis:

```powershell
npm test
npm run uploads:check
npm run uploads:clean
```

`uploads:check` apenas lista arquivos órfãos. `uploads:clean` remove somente os arquivos que não possuem referência no PostgreSQL.
