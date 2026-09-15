import { Router } from 'express';
import * as cronController from '../controllers/cron.controller';

const router = Router();

router.get('/cleanup', cronController.cleanupAssets);

export default router;