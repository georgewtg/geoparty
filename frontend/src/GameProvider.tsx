import { useState, type ReactNode } from "react";
import { GameContext, initialBoardData, type BoardData } from "./gameContext";


export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [boardData, setBoardData] = useState<BoardData>(initialBoardData);

  return (
    <GameContext.Provider value={{ boardData, setBoardData }}>
      {children}
    </GameContext.Provider>
  );
};