import { io, Socket } from "socket.io-client";

let wakeRequest: Promise<void> | null = null;

export const wakeSocket = (): Promise<void> => {
  if (!wakeRequest) {
    wakeRequest = fetch(new URL("/api/health", import.meta.env.VITE_SOCKET_URL))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Socket health check failed with status ${response.status}`);
        }
      })
      .catch((error) => {
        wakeRequest = null;
        throw error;
      });
  }

  return wakeRequest;
};

export const socket: Socket = io(import.meta.env.VITE_SOCKET_URL, {
  path: "/api/socketio",
  addTrailingSlash: false,
  transports: ["polling", "websocket"],
  autoConnect: false,
  reconnection: true,
});