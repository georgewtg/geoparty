import { createContext, useContext } from 'react';
import defaultBoardData from '../boards/test.json';

export type BoardData = typeof defaultBoardData;
export const initialBoardData = defaultBoardData;

interface GameContextType {
  boardData: BoardData;
  setBoardData: (data: BoardData) => void;
};

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};