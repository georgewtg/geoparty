import { api } from "./axios";
import { socket } from "./socket";
import type { ApiResponse } from "../types/api";
import type { AccountData } from "../types/account";
import type { RoomItem } from "../types/multiplayer";
import type { BoardPage } from "../types/board";

export const fetchRoom = async (roomId: string): Promise<ApiResponse<RoomItem>> => {
  const response = await api.get<ApiResponse<RoomItem>>(`/room/${roomId}`, {
    baseURL: `${import.meta.env.VITE_SOCKET_URL}/api`
  });
  return response.data;
};

export const createRoom = (user: AccountData, boardId: string, password: string) => {
  socket.emit("create_room", { user: user, boardId: boardId, password: password });
};

export const joinRoom = (user: AccountData, roomId: string, password: string) => {
  socket.emit("join_room", { user: user, roomId: roomId, password: password });
};

export const rejoinRoom = (roomId: string, userId: string) => {
  socket.emit("rejoin_room", { roomId: roomId, userId: userId });
};

export const updateScore = (roomId: string, playerId: string, score: number) => {
  socket.emit("update_score", { roomId: roomId, playerId: playerId, score: score })
};

export const changePage = (roomId: string, page: BoardPage) => {
  socket.emit("change_page", { roomId: roomId, page: page });
};

export const selectClue = (roomId: string, cellId: string) => {
  socket.emit("select_clue", { roomId: roomId, cellId: cellId });
};

export const changeCluePage = (roomId: string, index: number) => {
  socket.emit("change_clue_page", { roomId: roomId, index: index });
};

export const playMedia = (roomId: string, mediaId: string) => {
  socket.emit("play_media", { roomId: roomId, mediaId: mediaId });
};

export const pauseMedia = (roomId: string, mediaId: string) => {
  socket.emit("pause_media", { roomId: roomId, mediaId: mediaId });
};

export const seekMedia = (roomId: string, mediaId: string, currentTime: number) => {
  socket.emit("seek_media", { roomId: roomId, mediaId: mediaId, currentTime: currentTime });
};