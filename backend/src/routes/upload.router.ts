import { Router } from 'express';
// import { upload } from '../middleware/upload.middleware';
import * as uploadController from '../controllers/upload.controller';

const router = Router();

// router.post('/local', upload.single('file'), uploadController.uploadFileLocal);
router.get('/signature/:userId', uploadController.getUploadSignature);

export default router;