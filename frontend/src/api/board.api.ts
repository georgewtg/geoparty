import type { ApiResponse } from '../types/api';
import type { CreateBoardPayload, BoardItem, BoardListItem, UpdateBoardPayload } from '../types/board';
import { api } from './axios';

export const fetchAllTitles = async (): Promise<ApiResponse<BoardListItem[]>> => {
  const response = await api.get<ApiResponse<BoardListItem[]>>(`/board`);
  return response.data;
};

export const fetchBoard = async (boardId: number): Promise<ApiResponse<BoardItem>> => {
  const response = await api.get<ApiResponse<BoardItem>>(`/board/${boardId}`);
  return response.data;
};

// Create Board Board with information from formData and return boardId
export const createBoard = async (formData: CreateBoardPayload): Promise<ApiResponse<number>> => {
  const response = await api.post<ApiResponse<number>>('/board', formData);
  return response.data;
};

// update json field in Board Board
export const updateBoard = async (boardId: number, updates: UpdateBoardPayload): Promise<ApiResponse<BoardItem>> => {
  const response = await api.put<ApiResponse<BoardItem>>(`/board/${boardId}`, updates);
  return response.data;
};