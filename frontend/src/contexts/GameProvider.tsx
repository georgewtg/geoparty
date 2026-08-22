import { useState, type ReactNode } from "react";
import { boards, GameContext, initialBoardData, type BoardData } from "./gameContext";


export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to the first available loaded board, or initial template data
  const firstAvailableBoardKey = Object.keys(boards)[0];
  const defaultBoard = firstAvailableBoardKey ? boards[firstAvailableBoardKey] : initialBoardData;

  const [boardData, setBoardData] = useState<BoardData>(defaultBoard);

  const selectBoardByName = (name: string) => {
    if (boards[name]) {
      setBoardData(boards[name]);
    } else {
      console.warn(`Board "${name}" not found.`);
    }
  };

  return (
    <GameContext.Provider value={{ boardData, setBoardData, boards, selectBoardByName }}>
      {children}
    </GameContext.Provider>
  );
};