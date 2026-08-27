import type { ApiResponse } from '../types/api';
import type { CreateGamePayload, GameItem, GameListItem } from '../types/game';
import { api } from './axios';

export const fetchAllTitles = async (): Promise<ApiResponse<GameListItem[]>> => {
  const response = await api.get<ApiResponse<GameListItem[]>>(`/game`);
  return response.data;
};

export const fetchGame = async (gameId: number): Promise<ApiResponse<GameItem>> => {
  const response = await api.get<ApiResponse<GameItem>>(`/game/${gameId}`);
  return response.data;
};

// Create Game Board with information from formData and return gameId
export const createGame = async (formData: CreateGamePayload): Promise<ApiResponse<number>> => {
  const response = await api.post<ApiResponse<number>>('/game', formData);
  return response.data;
};