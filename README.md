# CAVEFY

Music from the Stone Age. Aplicação Full Stack para catalogar, descobrir e organizar músicas em playlists.

## O que foi implementado

- React + Vite com React Router e Zustand;
- login, cadastro, logout e sessão por token JWT;
- catálogo de músicas com busca, filtro por gênero e tela de detalhes;
- CRUD de músicas: título, artista, álbum, gênero, ano, duração, descrição, capa e áudio;
- upload de capa e MP3/WAV/OGG para músicas criadas pelo usuário;
- player fixo: músicas sem áudio ficam disponíveis apenas como item de catálogo;
- playlists do usuário e relação playlist ↔ música;
- PostgreSQL com usuários, gêneros, músicas, playlists e tabela associativa;
- validação com Zod no front e no back, tratamento de carregamento/erro/estado vazio e layout responsivo;
- modo demonstração no front para apresentação visual quando a API ou o PostgreSQL estiverem desligados.

## Executar o front

```powershell
npm install
npm run dev
```

Acesse `http://localhost:5173`. Na tela de login, use “Explorar modo demonstração” para testar a navegação sem banco. A API do CAVEFY usa a porta `3001` por padrão neste projeto.

## Executar o back-end

```powershell
cd backend
copy .env.example .env
npm install
npm run dev
```

Crie o banco `cavefy` no PostgreSQL e execute [`backend/database.sql`](./backend/database.sql). Depois preencha `backend/.env` com as credenciais locais.

## API principal

| Método | Rota | Ação |
| --- | --- | --- |
| POST | `/api/auth/cadastro` | cadastra usuário |
| POST | `/api/auth/login` | gera token JWT |
| GET | `/api/auth/me` | consulta sessão |
| GET/POST | `/api/musicas` | lista ou cadastra música |
| GET/PUT/DELETE | `/api/musicas/:id` | detalhes, edição ou exclusão |
| GET | `/api/generos` | lista gêneros |
| GET/POST | `/api/playlists` | lista ou cria playlist |
| PUT/DELETE | `/api/playlists/:id` | edita ou remove playlist |
| POST/DELETE | `/api/playlists/:id/musicas/:musicaId` | gerencia faixas da playlist |

## Regras de acesso

Todo catálogo e playlist exigem autenticação. Usuários podem gerenciar suas próprias músicas e playlists; administradores podem gerenciar músicas de outros usuários e cadastrar gêneros.

## Rotas do front

`/login`, `/cadastro`, `/dashboard`, `/musicas`, `/musicas/novo`, `/musicas/:id`, `/musicas/:id/editar` e `/playlists`.

## Integrantes

Preencha aqui os nomes da equipe antes da entrega.
