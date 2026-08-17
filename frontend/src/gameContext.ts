import { createContext, useContext } from 'react';
import defaultBoardData from '../boards/template.json';

export type BoardData = typeof defaultBoardData;
export const initialBoardData = defaultBoardData;

const boardModules = import.meta.glob<{ default: BoardData }>('../boards/*.json', { eager: true });

export const boards: Record<string, BoardData> = Object.entries(boardModules).reduce(
  (acc, [path, module]) => {
    if (!path.endsWith('template.json')) {
      const fileName = path.split('/').pop()?.replace('.json', '') ?? path;
      acc[fileName] = module.default;
    }
    return acc;
  },
  {} as Record<string, BoardData>
)

interface GameContextType {
  boardData: BoardData;
  setBoardData: (data: BoardData) => void;
  boards: Record<string, BoardData>; // Available pre-made boards
  selectBoardByName: (name: string) => void;
};

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};