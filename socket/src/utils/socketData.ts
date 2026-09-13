import { RoomState } from "../types/multiplayer";

const rooms = new Map<string, RoomState>();
const playerSockets = new Map<string, { roomId: string; userId: string }>();

export function setRoom(roomId: string, state: RoomState): void {
  rooms.set(roomId, state);
}

export function getRoom(roomId: string): RoomState | null {
  return rooms.get(roomId) ?? null;
}

export function deleteRoom(roomId: string): void {
  rooms.delete(roomId);
}

export function setPlayerInfo(roomId: string, socketId: string, userId: string): void {
  playerSockets.set(socketId, { roomId, userId });
}

export function getPlayerInfo(socketId: string): { roomId: string; userId: string } | null {
  return playerSockets.get(socketId) ?? null;
}

export function delPlayerInfo(socketId: string): void {
  playerSockets.delete(socketId);
}