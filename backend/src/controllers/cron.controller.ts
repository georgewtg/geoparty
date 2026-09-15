import { Request, Response } from 'express';
import * as assetService from '../services/asset.service';

export const cleanupAssets = async (req: Request, res: Response) => {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = req.headers.authorization;

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const deletedCount = await assetService.deleteUnreferencedAssets();
    return res.status(200).json({ success: true, deletedCount });
  } catch (error) {
    console.error('Error cleaning up unreferenced assets:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};