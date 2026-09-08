import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');
fs.mkdirSync(path.join(uploadDir, 'capas'), { recursive: true });
fs.mkdirSync(path.join(uploadDir, 'audios'), { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, file, cb) => cb(null, file.fieldname === 'audio' ? path.join(uploadDir, 'audios') : path.join(uploadDir, 'capas')),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
});
const audio = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
const image = ['image/jpeg', 'image/png', 'image/webp'];
export const uploadMusica = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const ok = file.fieldname === 'audio'
      ? audio.includes(file.mimetype) || ['.mp3', '.wav', '.ogg'].includes(extension)
      : image.includes(file.mimetype) || ['.jpg', '.jpeg', '.png', '.webp'].includes(extension);
    cb(ok ? null : new Error(file.fieldname === 'audio' ? 'Envie um áudio MP3, WAV ou OGG.' : 'Envie uma imagem JPG, PNG ou WEBP.'), ok);
  },
}).fields([{ name: 'audio', maxCount: 1 }, { name: 'capa', maxCount: 1 }]);

export const uploadCapa = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const ok = image.includes(file.mimetype) || ['.jpg', '.jpeg', '.png', '.webp'].includes(extension);
    cb(ok ? null : new Error('Envie uma imagem JPG, PNG ou WEBP.'), ok);
  },
}).single('capa');
