import { Request, Response } from 'express';
import * as gameService from '../services/game.service'


export const getAllTitles = async (req: Request, res: Response) => {
  try {
    const payload = await gameService.getAllTitleData();
    if (!payload) return res.status(404).json({ success: false, message: 'No game found' });

    res.status(200).json({ success: true, payload })
    
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getGame = async (req: Request, res: Response) => {
  try {
    const gameId = Number(req.params.id);
    if (!gameId) return res.status(400).json({ success: false, message: 'Invalid or missing Game ID' });

    const payload = await gameService.getGameData(gameId);
    if (!payload) return res.status(404).json({ success: false, message: 'Game not found' });
    
    res.status(200).json({ success: true, payload })

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const addGame = async (req: Request, res: Response) => {
  try {
    const { name, title, num_of_categories, num_of_questions } = req.body;

    const payload = await gameService.addGameData(name, title, num_of_categories, num_of_questions);
    if (!payload) return res.status(404).json({ success: false, message: 'Failed to Create Game Board' });
    
    res.status(200).json({ success: true, payload })

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};