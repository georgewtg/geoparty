import { Request, Response } from 'express';
import * as boardService from '../services/board.service'


export const getAllTitles = async (req: Request, res: Response) => {
  try {
    const payload = await boardService.getAllTitleData();
    if (!payload) return res.status(404).json({ success: false, message: 'No board found' });

    res.status(200).json({ success: true, payload })
    
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getBoard = async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.params.id);
    if (!boardId) return res.status(400).json({ success: false, message: 'Invalid or missing Board ID' });

    const payload = await boardService.getBoardData(boardId);
    if (!payload) return res.status(404).json({ success: false, message: 'Board not found' });
    
    res.status(200).json({ success: true, payload })

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const addBoard = async (req: Request, res: Response) => {
  try {
    const { name, title, num_of_categories, num_of_questions } = req.body;

    const payload = await boardService.addBoardData(name, title, num_of_categories, num_of_questions);
    if (!payload) return res.status(404).json({ success: false, message: 'Failed to Create Board Board' });
    
    res.status(200).json({ success: true, payload })

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const editBoard = async (req: Request, res: Response) => {
  try {
    const boardId = Number(req.params.id);
    const updates = req.body;

    const payload = await boardService.editBoardData(boardId, updates);
    if (!payload) return res.status(404).json({ success: false, message: 'Failed to Update Board Board' });
    
    res.status(200).json({ success: true, payload })

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};