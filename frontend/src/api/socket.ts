import { io, Socket } from "socket.io-client";

export const socket: Socket = io({
  path: "/api/socketio",
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
});