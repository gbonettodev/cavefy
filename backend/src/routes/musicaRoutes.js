import { Router } from "express";
import {
  atualizar,
  buscarPorId,
  criar,
  listar,
  registrarReproducao,
  remover,
} from "../controllers/musicaController.js";
import { autenticar } from "../middlewares/auth.js";
import { uploadMusica } from "../middlewares/upload.js";
const router = Router();
router.use(autenticar);
router.get("/", listar);
router.get("/:id", buscarPorId);
router.post("/:id/reproducoes", registrarReproducao);
router.post("/", uploadMusica, criar);
router.put("/:id", uploadMusica, atualizar);
router.delete("/:id", remover);
export default router;
