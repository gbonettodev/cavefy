import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../../uploads");
fs.mkdirSync(path.join(uploadDir, "capas"), { recursive: true });
fs.mkdirSync(path.join(uploadDir, "audios"), { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, file, callback) =>
    callback(
      null,
      file.fieldname === "audio"
        ? path.join(uploadDir, "audios")
        : path.join(uploadDir, "capas"),
    ),
  filename: (_req, file, callback) =>
    callback(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path
        .extname(file.originalname)
        .toLowerCase()}`,
    ),
});

const audioTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
];
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const audioExtensions = [".mp3", ".wav", ".ogg"];
const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

function validateFile(file, callback) {
  const extension = path.extname(file.originalname).toLowerCase();
  const isAudio = file.fieldname === "audio";
  const valid = isAudio
    ? audioTypes.includes(file.mimetype) && audioExtensions.includes(extension)
    : imageTypes.includes(file.mimetype) && imageExtensions.includes(extension);

  callback(
    valid
      ? null
      : new Error(
          isAudio
            ? "Envie um áudio MP3, WAV ou OGG."
            : "Envie uma imagem JPG, PNG ou WEBP.",
        ),
    valid,
  );
}

export const uploadMusica = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => validateFile(file, callback),
}).fields([
  { name: "audio", maxCount: 1 },
  { name: "capa", maxCount: 1 },
]);

export const uploadCapa = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const valid =
      imageTypes.includes(file.mimetype) && imageExtensions.includes(extension);
    callback(valid ? null : new Error("Envie uma imagem JPG, PNG ou WEBP."), valid);
  },
}).single("capa");
