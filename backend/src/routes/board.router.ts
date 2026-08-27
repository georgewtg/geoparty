import { Router } from 'express';
import * as boardController from '../controllers/board.controller';

const router = Router();

router.get('/', boardController.getAllTitles);
router.get('/:id', boardController.getBoard);
router.post('/', boardController.addBoard)
router.put('/:id', boardController.editBoard)

export default router;