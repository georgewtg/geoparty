import { Router } from 'express';
import * as gameController from '../controllers/game.controller';

const router = Router();

router.get('/', gameController.getAllTitles);
router.get('/:id', gameController.getGame);
router.post('/', gameController.addGame)

export default router;