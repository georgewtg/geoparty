import { Request, Response } from 'express';
import * as assetService from '../services/asset.service'


export const addAsset = async (req: Request, res: Response) => {
  try {
    const { publicId, type } = req.body;

    const payload = await assetService.addAssetData(publicId, type);
    if (!payload) return res.status(404).json({ success: false, message: 'Failed to Create Asset Entry' });
    
    res.status(200).json({ success: true, payload });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};