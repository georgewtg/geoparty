import { Router } from 'express';
import * as accountController from '../controllers/account.controller'

const router = Router();

router.post('/register', accountController.register);
router.post('/login', accountController.login);
router.get('/me', accountController.checkAuth)

export default router;