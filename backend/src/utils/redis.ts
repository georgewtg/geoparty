import { createClient } from "redis";
import { RoomState } from "../types/multiplayer";

const REDIS_URL = process.env.REDIS_URL;

export const pubClient = createClient({ url: REDIS_URL });
export const subClient = pubClient.duplicate();
export const redisClient = pubClient.duplicate();

pubClient.on("connect", () => console.log("✅ Redis Pub Client Connected"));
subClient.on("connect", () => console.log("✅ Redis Sub Client Connected"));
redisClient.on("connect", () => console.log("✅ Redis Main Client Connected"));

pubClient.on("error", (err) => console.error("❌ Redis Pub Error:", err));
subClient.on("error", (err) => console.error("❌ Redis Sub Error:", err));
redisClient.on("error", (err) => console.error("❌ Redis Main Error:", err));


// redis room helper
export async function setRoom(roomId: string, state: RoomState): Promise<void> {
  await redisClient.set(`room:${roomId}`, JSON.stringify(state), { EX: 86400 }); // ttl 24 hours
};

export async function getRoom(roomId: string): Promise<RoomState | null> {
  const data = await redisClient.get(`room:${roomId}`);
  return data ? JSON.parse(data) : null;
};

export async function deleteRoom(roomId: string): Promise<void> {
  await redisClient.del(`room:${roomId}`);
};

export async function setPlayerInfo(roomId: string, socketId: string, userId: string): Promise<void> {
  await redisClient.set(`socket:${socketId}`, JSON.stringify({ roomId: roomId, userId: userId }), { EX: 86400 });
};

export async function getPlayerInfo(socketId: string): Promise<{ roomId: string, userId: string } | null> {
  const data = await redisClient.get(`socket:${socketId}`);
  return data ? JSON.parse(data) : null;
};

export async function delPlayerInfo(socketId: string): Promise<void> {
  await redisClient.del(`socket:${socketId}`);
};