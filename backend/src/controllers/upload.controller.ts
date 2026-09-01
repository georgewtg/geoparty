import { Request, Response } from 'express';
import * as uploadService from '../services/upload.service'


export const uploadFileLocal = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const payload = await uploadService.uploadFileDataLocal(req.file);
    if (!payload) return res.status(404).json({ success: false, message: 'Failed to upload file locally' });
    
    res.status(200).json({ success: true, payload });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};