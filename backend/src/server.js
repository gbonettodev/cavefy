import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoutes.js';
import musicaRoutes from './routes/musicaRoutes.js';
import generoRoutes from './routes/generoRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', app: 'CAVEFY API' }));
app.use('/api/auth', authRoutes);
app.use('/api/musicas', musicaRoutes);
app.use('/api/generos', generoRoutes);
app.use('/api/playlists', playlistRoutes);
app.use((error, _req, res, _next) => {
  console.error(error);
  const mensagem = error.code === 'LIMIT_FILE_SIZE' ? 'O arquivo enviado ultrapassa o tamanho permitido.' : error.message || 'Erro interno do servidor.';
  const status = error.name === 'ZodError' || error.code === 'LIMIT_UNEXPECTED_FILE' || error.message?.startsWith('Envie um') ? 400 : error.statusCode || 500;
  return res.status(status).json({ mensagem });
});
app.listen(PORT, () => console.log(`CAVEFY API rodando em http://localhost:${PORT}`));
