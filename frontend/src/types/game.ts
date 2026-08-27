import type { BoardData } from "./board";

export type GameListItem = {
  id: number;
  name: string;
};

export type GameItem = {
  id: number;
  name: string;
  game_data: BoardData;
};

export type CreateGamePayload = {
  name: string;
  title: string;
  num_of_categories: number;
  num_of_questions: number;
};