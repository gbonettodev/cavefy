# CAVEFY

Aplicação full stack para catalogar músicas, ouvir arquivos adicionados pelo usuário e organizar faixas em playlists. O projeto combina uma interface React responsiva com uma API REST em Node.js, Express e PostgreSQL.

> **Importante:** as imagens anexadas ao projeto são referências visuais da interface. As instruções deste documento são apenas as informações técnicas do código atual.

## Visão geral

O CAVEFY funciona conectado à API REST e ao PostgreSQL:

- **Modo conectado:** usa a API e o PostgreSQL para autenticação, catálogo, uploads e playlists.

### Funcionalidades

- Cadastro, login, logout e sessão com token JWT.
- Página inicial com saudação personalizada pelo primeiro nome do usuário.
- Catálogo com busca por título, artista ou álbum e filtro por gênero.
- Cadastro, edição, detalhes e exclusão de músicas.
- Upload de capa e áudio para músicas cadastradas pelo usuário.
- Player fixo com play/pause, faixa anterior, próxima faixa, progresso e volume.
- Contagem de reproduções e seção “Top 1 · mais escutada”.
- Criação, exclusão e detalhes de playlists.
- Associação e remoção de músicas em playlists.
- Edição do nome e da foto de perfil.
- Layout responsivo para desktop e dispositivos móveis.
- Estados de carregamento, erro, catálogo vazio e notificações visuais.

## Tecnologias

### Frontend

- React 19
- Vite 8
- React Router 7
- Zustand 5
- React Hook Form
- Zod
- Lucide React
- React Toastify

### Backend

- Node.js com módulos ES
- Express
- PostgreSQL
- `pg`
- JWT com `jsonwebtoken`
- Senhas protegidas com `bcryptjs`
- Uploads com `multer`
- Validação com Zod
- CORS com `cors`

## Pré-requisitos

Instale antes de começar:

- Node.js 18 ou superior;
- npm;
- PostgreSQL 14 ou superior;
- Git, caso o projeto seja obtido por um repositório.

No Windows, o PostgreSQL pode ser configurado pelo pgAdmin. Os comandos `psql` e `createdb` são opcionais, mas facilitam a configuração pelo terminal.

## Estrutura do projeto

```text
cavefy/
├── backend/
│   ├── database.sql
│   ├── src/
│   │   ├── controllers/       # Regras das operações da API
│   │   ├── database/          # Conexão com PostgreSQL
│   │   ├── middlewares/       # JWT e upload de arquivos
│   │   ├── routes/            # Rotas HTTP
│   │   └── validations/       # Schemas do backend
│   └── uploads/
│       ├── audios/            # Áudios enviados
│       └── capas/             # Capas e fotos enviadas
├── public/                    # Favicon público
├── src/
│   ├── app/
│   │   └── AppRouter.jsx      # Configuração das rotas do frontend
│   ├── assets/                # Logo e imagem principal do CAVEFY
│   ├── components/            # Componentes reutilizáveis
│   ├── layouts/               # Estrutura compartilhada das páginas autenticadas
│   ├── pages/                 # Uma página por arquivo
│   ├── services/              # Comunicação com API e funções de mídia
│   ├── store/                 # Estado global do usuário e player
│   ├── styles/                # Estilos globais, layout, início e perfil
│   ├── validation/            # Schemas do frontend
│   └── main.jsx               # Montagem do React
├── .env                      # Configuração do frontend
├── package.json
└── README.md
```

### Organização do frontend

As telas não ficam concentradas em um único arquivo. Cada página tem responsabilidade própria:

| Pasta/arquivo | Responsabilidade |
| --- | --- |
| `src/pages/AuthPage.jsx` | Login e cadastro |
| `src/pages/HomePage.jsx` | Início, Top 1 e músicas recentes |
| `src/pages/CatalogPage.jsx` | Busca e listagem do catálogo |
| `src/pages/MusicFormPage.jsx` | Cadastro e edição de músicas |
| `src/pages/MusicDetailsPage.jsx` | Detalhes e ações de uma música |
| `src/pages/PlaylistsPage.jsx` | Criação e listagem de playlists |
| `src/pages/PlaylistDetailsPage.jsx` | Faixas de uma playlist |
| `src/pages/ProfilePage.jsx` | Nome e foto do perfil |
| `src/layouts/ProtectedLayout.jsx` | Sidebar, header, conteúdo e player |
| `src/components/` | Menu de perfil, player, capas, linhas e formulários |
| `src/styles/` | Estilos separados por responsabilidade visual |
| `src/services/` | `apiFetch`, URLs de mídia e utilitários |
| `src/store/index.js` | Usuário, token, reproduções e player |

## Configuração do ambiente

### Frontend

Na raiz do projeto, crie ou edite o arquivo `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

Se a API estiver em outro endereço ou porta, altere esse valor. Como a variável começa com `VITE_`, ela é disponibilizada ao frontend durante o build.

### Backend

Crie `backend/.env` com os dados do seu PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgres
DB_NAME=cavefy
PORT=3001
JWT_SECRET=troque-por-um-segredo-forte
FRONTEND_URL=http://localhost:5173
```

`JWT_SECRET` é opcional no código, mas deve ser definido em qualquer ambiente real. Se não for informado, o backend usa um segredo local padrão, apropriado apenas para desenvolvimento.

## Instalação e execução

### 1. Criar e preparar o banco

Crie um banco chamado `cavefy`:

```powershell
createdb -U postgres cavefy
```

Ou crie o banco pelo pgAdmin.

Depois execute o schema:

```powershell
psql -U postgres -d cavefy -f backend/database.sql
```

O arquivo cria as tabelas `usuarios`, `generos`, `musicas`, `playlists` e `playlist_musicas`, além dos índices e gêneros iniciais.

> **Atenção:** `backend/database.sql` começa removendo as tabelas existentes com `DROP TABLE ... CASCADE`. Isso apaga os dados dessas tabelas. Use esse arquivo para uma instalação nova ou faça backup antes de executá-lo novamente.

### 2. Instalar e iniciar o backend

Em um terminal:

```powershell
cd backend
npm install
npm run dev
```

A API ficará disponível em:

- `http://localhost:3001`
- Health check: `http://localhost:3001/health`
- Arquivos enviados: `http://localhost:3001/uploads/...`

Para iniciar sem o Nodemon:

```powershell
npm start
```

### 3. Instalar e iniciar o frontend

Em outro terminal, na raiz do projeto:

```powershell
npm install
npm run dev
```

Acesse `http://localhost:5173`.

A tela de login exige que a API esteja disponível para autenticar e carregar os dados do PostgreSQL.`n
## Scripts disponíveis

### Raiz do projeto

| Comando | Função |
| --- | --- |
| `npm run dev` | Inicia o Vite em desenvolvimento |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Analisa o código com Oxlint |

### `backend/`

| Comando | Função |
| --- | --- |
| `npm run dev` | Inicia a API com Nodemon |
| `npm start` | Inicia a API com Node.js |

## Rotas do frontend

| Rota | Tela | Proteção |
| --- | --- | --- |
| `/login` | Login | Pública |
| `/cadastro` | Cadastro | Pública |
| `/dashboard` | Página inicial | Autenticada |
| `/musicas` | Catálogo | Autenticada |
| `/musicas/novo` | Nova música | Autenticada |
| `/musicas/:id` | Detalhes da música | Autenticada |
| `/musicas/:id/editar` | Editar música | Autenticada |
| `/playlists` | Playlists | Autenticada |
| `/playlists/:id` | Detalhes da playlist | Autenticada |
| `/perfil` | Informações do perfil | Autenticada |

Usuários não autenticados são redirecionados para `/login` pelo `ProtectedRoute`.

## API REST

Todas as rotas abaixo usam o prefixo `http://localhost:3001`. Exceto `/health`, cadastro e login, as rotas exigem:

```http
Authorization: Bearer SEU_TOKEN_JWT
```

### Saúde e autenticação

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Verifica se a API está online |
| `POST` | `/api/auth/cadastro` | Cria usuário e retorna usuário + token |
| `POST` | `/api/auth/login` | Valida credenciais e retorna usuário + token |
| `GET` | `/api/auth/me` | Retorna o usuário da sessão atual |
| `PUT` | `/api/auth/me` | Atualiza nome, e-mail, senha e/ou foto |

Cadastro e login recebem JSON:

```json
{
  "nome": "Gustavo Bonetto",
  "email": "gustavo@email.com",
  "senha": "senha-com-no-minimo-6"
}
```

Para atualizar o perfil, use `multipart/form-data` com os campos `nome`, `email`, `senha` (opcional) e `capa` (opcional).

### Músicas

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/musicas` | Lista músicas |
| `GET` | `/api/musicas/:id` | Busca uma música |
| `POST` | `/api/musicas` | Cadastra uma música |
| `PUT` | `/api/musicas/:id` | Atualiza uma música |
| `DELETE` | `/api/musicas/:id` | Exclui uma música |

`GET /api/musicas` aceita os filtros opcionais `busca` e `genero`:

```text
/api/musicas?busca=rock&genero=1
```

O cadastro e a edição usam `multipart/form-data` com:

- `titulo`;
- `artista`;
- `album`;
- `genero_id`;
- `ano`;
- `duracao_segundos`;
- `descricao`;
- `capa`;
- `audio`.

### Gêneros

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/generos` | Lista gêneros disponíveis |
| `POST` | `/api/generos` | Cria gênero; exige administrador |

### Playlists

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/playlists` | Lista playlists do usuário |
| `GET` | `/api/playlists/:id` | Retorna playlist e suas músicas |
| `POST` | `/api/playlists` | Cria playlist |
| `PUT` | `/api/playlists/:id` | Atualiza playlist |
| `DELETE` | `/api/playlists/:id` | Exclui playlist |
| `POST` | `/api/playlists/:id/musicas/:musicaId` | Adiciona música à playlist |
| `DELETE` | `/api/playlists/:id/musicas/:musicaId` | Remove música da playlist |

## Regras de acesso

- O catálogo, os gêneros e as playlists exigem autenticação.
- Cada usuário visualiza e gerencia suas próprias playlists.
- Usuários podem editar as próprias músicas.
- Qualquer usuário autenticado pode excluir músicas do catálogo.
- Administradores podem editar e excluir músicas de outros usuários.
- Somente administradores podem cadastrar gêneros pela API.
- O cadastro de usuário começa com o papel `usuario`.

Para promover um usuário manualmente no banco:

```sql
UPDATE usuarios
SET papel = 'administrador'
WHERE email = 'admin@exemplo.com';
```

## Uploads e arquivos de mídia

| Tipo | Campos | Limite | Formatos |
| --- | --- | --- | --- |
| Áudio de música | `audio` | 25 MB | MP3, WAV, OGG |
| Capa de música | `capa` | 25 MB no endpoint de música | JPG, PNG, WEBP |
| Foto de perfil | `capa` | 5 MB | JPG, PNG, WEBP |
| Capa de playlist | `capa` | 5 MB | JPG, PNG, WEBP |

Os arquivos são gravados em `backend/uploads/audios` e `backend/uploads/capas`. Essa pasta não deve ser apagada se os registros do banco ainda apontarem para os arquivos.

## Banco de dados e persistência`n`nTodos os dados de negócio — usuários, músicas, gêneros e playlists — são carregados e persistidos pela API no PostgreSQL. O navegador mantém apenas o usuário e o token JWT da sessão para permitir a continuidade do login após atualizar a página.`n`n## Sessão e segurança

- O backend gera tokens JWT com validade de 7 dias.
- As senhas nunca são armazenadas em texto puro; são transformadas em hash com bcrypt.
- O frontend guarda o usuário e o token no `localStorage` para manter a sessão após atualizar a página.
- Em produção, altere `JWT_SECRET`, restrinja `FRONTEND_URL` e não publique arquivos `.env`.
- Para produção, recomenda-se usar HTTPS, armazenamento de arquivos dedicado e políticas de backup do PostgreSQL.

## Solução de problemas

### “API offline” ou erro de conexão

1. Verifique se o backend está rodando na porta `3001`.
2. Abra `http://localhost:3001/health` e confirme o JSON com `status: "ok"`.
3. Confirme se `VITE_API_URL` aponta para `http://localhost:3001/api`.
4. Reinicie o Vite após alterar o `.env`.

### Erro de banco de dados

1. Confirme se o serviço PostgreSQL está ativo.
2. Teste usuário, senha, porta e nome do banco no `backend/.env`.
3. Verifique se `backend/database.sql` foi executado no banco correto.

### Upload não aparece

1. Confirme o limite e o formato do arquivo.
2. Verifique se o arquivo foi criado em `backend/uploads`.
3. Confirme se o backend está respondendo pelas URLs `/uploads/...`.
4. Atualize a página com `Ctrl + F5` para limpar o bundle antigo do navegador.

### A interface parece desatualizada

Pare e reinicie o Vite:

```powershell
npm run dev
```

Depois faça uma atualização forçada no navegador com `Ctrl + F5`.

## Validação do projeto

Antes de considerar uma alteração pronta, execute na raiz:

```powershell
npm run lint
npm run build
```

O projeto não possui uma suíte automatizada de testes end-to-end no momento. A verificação atual é feita pelo lint, pelo build de produção e pela checagem manual dos fluxos principais.

## Equipe

Preencha os nomes dos integrantes antes da entrega final.
