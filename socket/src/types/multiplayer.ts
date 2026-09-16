export type BoardPage = 'TITLE' | 'BOARD' | 'CLUE';

export type BuzzEvent = {
  name: string;
  pressTime: number;
}

export type Player = {
  socketId: string;
  username: string;
  score: number;
  isConnected: boolean;
}

export type RoomState = {
  isOpen: boolean;
  hostId: string;
  boardId: string;
  password: string;
  buzzQueue: BuzzEvent[];
  gameState: GameState;
  players: Record<string, Player>;
}

export type PlayerItem = {
  username: string;
  score: number;
  isConnected: boolean;
};

export type GameState = {
  page: BoardPage;
  visitedCells: string[];
  cluePageIdx: number;
  cellId: string;
};

export type RoomItem = {
  isOpen: boolean;
  hostId: string;
  boardId: string;
  password: string;
  buzzQueue: BuzzEvent[];
  gameState: GameState;
  players: Record<string, PlayerItem>;
};