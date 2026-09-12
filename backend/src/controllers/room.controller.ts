import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as roomService from '../services/room.service'


export const getRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    if (!roomId || typeof roomId !== 'string') return res.status(400).json({ success: false, message: 'Invalid or missing Room ID' });

    const payload = await roomService.getRoomData(roomId);
    if (!payload) return res.status(404).json({ success: false, message: 'Room not found' });
    
    res.status(200).json({ success: true, payload });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};