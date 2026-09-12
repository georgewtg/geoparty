import { Player, PlayerItem, RoomItem } from "../types/multiplayer";
import { redisClient } from "../utils/redis";

export const getRoomData = async (roomId: string) => {
  try {
    const result = await redisClient.get(`room:${roomId}`);
    if (!result) return result;

    const parsedRoom = JSON.parse(result);

    const transformedPlayers: Record<string, PlayerItem> = {};
    if (parsedRoom.players) {
      for (const [playerId, player] of Object.entries(parsedRoom.players as Record<string, Player>)) {
        transformedPlayers[playerId] = {
          username: player.username,
          score: player.score ?? 0,
        };
      }
    }

    const roomItem: RoomItem = {
      isOpen: parsedRoom.isOpen,
      hostId: parsedRoom.hostId,
      boardId: parsedRoom.boardId,
      password: parsedRoom.password,
      buzzQueue: parsedRoom.buzzQueue || [],
      gameState: parsedRoom.gameState,
      players: transformedPlayers,
    };

    return roomItem;
    
  } catch (error) {
    console.error("Error fetching board data:", error);
    throw error;
  }
};