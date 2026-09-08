import { Router } from 'express';
import { listar, criar } from '../controllers/generoController.js';
import { autenticar, somenteAdministrador } from '../middlewares/auth.js';
const router = Router();
router.use(autenticar);
router.get('/', listar);
router.post('/', somenteAdministrador, criar);
export default router;
