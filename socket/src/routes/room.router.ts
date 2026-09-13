import { Router } from 'express';
import * as roomController from '../controllers/room.controller';

const router = Router();

router.get('/:id', roomController.getRoom);

export default router;