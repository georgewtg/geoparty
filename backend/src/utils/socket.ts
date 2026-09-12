import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from "@socket.io/redis-adapter";
import crypto from "node:crypto";
import { delPlayerInfo, getPlayerInfo, getRoom, pubClient, redisClient, setPlayerInfo, setRoom, subClient } from './redis';
import { AccountData } from '../types/account';
import { BoardPage } from '../types/board';
import { RoomState } from '../types/multiplayer';


// socket initializer
export const initSocket = async (server: HttpServer): Promise<Server> => {
  // connect redis clients
  await Promise.all([
    pubClient.connect(),
    subClient.connect(),
    redisClient.connect(),
  ]);

  const io = new Server(server, {
    path: "/api/socketio",
    addTrailingSlash: false,
    transports: ["websocket"],
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // attach redis adapter
  io.adapter(createAdapter(pubClient, subClient));

  // broadcast updated player list
  async function broadcastPlayersUpdates(roomId: string, roomState: RoomState) {
    const publicPlayers = Object.fromEntries(
      Object.entries(roomState.players)
        .filter(([id]) => id !== roomState.hostId)
        .map(([id, player]) => [
          id,
          { username: player.username, score: player.score, isConnected: player.isConnected },
        ])
    );
    io.in(roomId).emit("update_players", publicPlayers)
  };

  io.on("connection", (socket: Socket) => {
    // create room event
    socket.on("create_room", async (data: { user: AccountData, boardId: string, password: string }) => {
      const roomId = crypto.randomBytes(3).toString("hex").toUpperCase();

      const roomState = {
        isOpen: true,
        hostId: data.user.id,
        boardId: data.boardId,
        password: data.password,
        buzzQueue: [],
        gameState: {
          page: 'TITLE' as const,
          visitedCells: [],
          cluePageIdx: 0,
          cellId: ''
        },
        players: {
          [data.user.id]: {
            socketId: socket.id,
            username: data.user.username,
            score: 0,
            isConnected: true
          }
        }
      };
      await setRoom(roomId, roomState);
      await setPlayerInfo(roomId, socket.id, data.user.id);
      socket.emit("room_created", roomId);
    });

    // join room event
    socket.on("join_room", async (data: { user: AccountData, roomId: string, password: string }) => {
      // check room exists
      const roomState = await getRoom(data.roomId);
      if (!roomState) {
        socket.emit("room_not_found");
        return;
      }

      // check password
      if (data.password !== roomState.password) {
        socket.emit("wrong_password");
        return;
      }

      const existingPlayer = roomState.players[data.user.id];
      roomState.players[data.user.id] = {
        socketId: socket.id,
        username: data.user.username,
        score: existingPlayer ? existingPlayer.score : 0,
        isConnected: true,
      };

      await setRoom(data.roomId, roomState);
      await setPlayerInfo(data.roomId, socket.id, data.user.id);
      socket.emit("room_joined");
    });

    // rejoin room event (confirm user has joined the room)
    socket.on("rejoin_room", async ( data: { roomId: string, userId: string }) => {
      const roomState = await getRoom(data.roomId);
      if (!roomState || !roomState.players[data.userId]) {
        socket.emit("room_not_found");
        return;
      }

      const player = roomState.players[data.userId];
      if (!player.isConnected || player.socketId !== socket.id) {
        if (player.socketId && player.socketId !== socket.id) {
          await delPlayerInfo(player.socketId);
        }

        roomState.players[data.userId].socketId = socket.id;
        roomState.players[data.userId].isConnected = true;

        await setRoom(data.roomId, roomState);
        await setPlayerInfo(data.roomId, socket.id, data.userId);
      }

      socket.join(data.roomId);
      socket.emit("room_rejoined");
      broadcastPlayersUpdates(data.roomId, roomState);
    });

    // update score event
    socket.on("update_score", async (data: { roomId: string, playerId: string, score: number }) => {
      const roomState = await getRoom(data.roomId);
      if (!roomState) return;
      
      roomState.players[data.playerId].score = data.score;
      await setRoom(data.roomId, roomState);

      socket.to(data.roomId).emit("score_updated", { playerId: data.playerId, score: data.score });
    });

    // change main page event
    socket.on("change_page", async (data: { roomId: string, page: BoardPage }) => {
      const roomState = await getRoom(data.roomId);
      if (!roomState) return;
      
      roomState.gameState.page = data.page;
      await setRoom(data.roomId, roomState);

      socket.to(data.roomId).emit("page_changed", data.page);
    });

    // select clue, change to clue page, and update visited celss event
    socket.on("select_clue", async (data: { roomId: string, cellId: string }) => {
      const roomState = await getRoom(data.roomId);
      if (!roomState) return;

      roomState.gameState.page = 'CLUE';
      roomState.gameState.cellId = data.cellId;
      roomState.gameState.visitedCells.push(data.cellId);
      await setRoom(data.roomId, roomState);

      socket.to(data.roomId).emit("clue_selected", data.cellId);
    });

    // change clue page event
    socket.on("change_clue_page", async (data: { roomId: string, index: number }) => {
      const roomState = await getRoom(data.roomId);
      if (!roomState) return;

      roomState.gameState.cluePageIdx = data.index;
      await setRoom(data.roomId, roomState);

      socket.to(data.roomId).emit("clue_page_changed", data.index);
    });

    // play media event
    socket.on("play_media", async (data: { roomId: string, mediaId: string }) => {
      socket.to(data.roomId).emit("media_played", data.mediaId);
    });

    // pause media event
    socket.on("pause_media", async (data: { roomId: string, mediaId: string }) => {
      socket.to(data.roomId).emit("media_paused", data.mediaId);
    });

    // seek media event (move timestamp)
    socket.on("seek_media", async (data: { roomId: string, mediaId: string, currentTime: number }) => {
      socket.to(data.roomId).emit("media_seeked", { mediaId: data.mediaId, currentTime: data.currentTime });
    });

    // handle disconnect event
    socket.on("disconnect", async () => {
      const playerInfo = await getPlayerInfo(socket.id);
      if (!playerInfo) return;

      const roomState = await getRoom(playerInfo.roomId);
      if (!roomState || !roomState.players[playerInfo.userId]) return;

      roomState.players[playerInfo.userId].isConnected = false;
      await setRoom(playerInfo.roomId, roomState);

      await delPlayerInfo(socket.id);
      broadcastPlayersUpdates(playerInfo.roomId, roomState);
    });
  });

  return io;
};

export default initSocket;