import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/environment.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import generoRoutes from "./routes/generoRoutes.js";
import musicaRoutes from "./routes/musicaRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import { uploadsDirectory } from "./services/fileStorage.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", env.production ? 1 : false);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.frontendOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error("Origem não autorizada pelo CORS.");
      error.statusCode = 403;
      return callback(error);
    },
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(
  "/uploads",
  express.static(uploadsDirectory, {
    fallthrough: false,
    maxAge: env.production ? "1d" : 0,
  }),
);

app.get("/health", (_req, res) =>
  res.status(200).json({ status: "ok", app: "CAVEFY API" }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    mensagem: "Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente.",
  },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/musicas", musicaRoutes);
app.use("/api/generos", generoRoutes);
app.use("/api/playlists", playlistRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
