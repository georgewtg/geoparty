import { Router } from 'express';
import * as assetController from '../controllers/asset.controller';

const router = Router();

router.post('/', assetController.addAsset)

export default router;