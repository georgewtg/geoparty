import type { BoardPage } from "./board";

export type Player = {
  socketId: string;
  name: string;
  score: number;
  isHost: boolean;
  isConnected: boolean;
};

export type PlayerItem = {
  username: string;
  score: number;
};

export type GameState = {
  page: BoardPage;
  visitedCells: string[];
  cluePageIdx: number;
  cellId: string;
};

export type BuzzEvent= {
  name: string;
  time: number;
};

export type RoomItem = {
  isOpen: boolean;
  hostId: string;
  boardId: string;
  password: string;
  buzzQueue: BuzzEvent[];
  players: Record<string, PlayerItem>;
  gameState: GameState;
};

export type CreateRoomPayload = {
  board_id: string;
  password: string;
};

export type JoinRoomPayload = {
  room_id: string;
  password: string;
};