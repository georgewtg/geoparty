import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import crypto from "node:crypto";
import { delPlayerInfo, getPlayerInfo, getRoom, setPlayerInfo, setRoom } from './socketData';
import { AccountData } from '../types/account';
import { BoardPage, Player, PlayerItem, RoomItem, RoomState } from '../types/multiplayer';


// socket initializer
export const initSocket = async (server: HttpServer): Promise<Server> => {
  const allowedOrigins = (process.env.CLIENT_URL ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  console.log('[socket] Path: /api/socketio');
  console.log('[socket] Allowed origins:', allowedOrigins.length ? allowedOrigins : 'none');
  console.log('[socket] Transports: polling, websocket');

  const io = new Server(server, {
    path: "/api/socketio",
    addTrailingSlash: false,
    transports: ["polling", "websocket"],
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.engine.on('connection_error', (error) => {
    console.error('[socket] Handshake error:', {
      message: error.message,
      code: error.code,
      origin: error.req?.headers.origin,
      url: error.req?.url,
    });
  });

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
    console.log('[socket] Client connected:', {
      socketId: socket.id,
      origin: socket.handshake.headers.origin ?? 'none',
      address: socket.handshake.address,
      transport: socket.conn.transport.name,
    });

    socket.conn.on('upgrade', () => {
      console.log('[socket] Transport upgraded:', {
        socketId: socket.id,
        transport: socket.conn.transport.name,
      });
    });

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
      setRoom(roomId, roomState);
      setPlayerInfo(roomId, socket.id, data.user.id);
      socket.emit("room_created", roomId);
    });

    // join room event
    socket.on("join_room", async (data: { user: AccountData, roomId: string, password: string }) => {
      // check room exists
      const roomState = getRoom(data.roomId);
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

      setRoom(data.roomId, roomState);
      setPlayerInfo(data.roomId, socket.id, data.user.id);
      socket.emit("room_joined");
    });

    // rejoin room event (confirm user has joined the room)
    socket.on("rejoin_room", async ( data: { roomId: string, userId: string }) => {
      const roomState = getRoom(data.roomId);
      if (!roomState || !roomState.players[data.userId]) {
        socket.emit("room_not_found");
        return;
      }

      const player = roomState.players[data.userId];
      if (!player.isConnected || player.socketId !== socket.id) {
        if (player.socketId && player.socketId !== socket.id) {
          delPlayerInfo(player.socketId);
        }

        roomState.players[data.userId].socketId = socket.id;
        roomState.players[data.userId].isConnected = true;

        setRoom(data.roomId, roomState);
        setPlayerInfo(data.roomId, socket.id, data.userId);
      }

      const transformedPlayers: Record<string, PlayerItem> = {};
      if (roomState.players) {
        for (const [playerId, player] of Object.entries(roomState.players as Record<string, Player>)) {
          transformedPlayers[playerId] = {
            username: player.username,
            score: player.score ?? 0,
          };
        }
      }
  
      const roomItem: RoomItem = {
        isOpen: roomState.isOpen,
        hostId: roomState.hostId,
        boardId: roomState.boardId,
        password: roomState.password,
        buzzQueue: roomState.buzzQueue || [],
        gameState: roomState.gameState,
        players: transformedPlayers,
      };

      socket.join(data.roomId);
      socket.emit("room_rejoined", roomItem);
      broadcastPlayersUpdates(data.roomId, roomState);
    });

    // update score event
    socket.on("update_score", async (data: { roomId: string, playerId: string, score: number }) => {
      const roomState = getRoom(data.roomId);
      if (!roomState) return;
      
      roomState.players[data.playerId].score = data.score;
      setRoom(data.roomId, roomState);

      socket.to(data.roomId).emit("score_updated", { playerId: data.playerId, score: data.score });
    });

    // change main page event
    socket.on("change_page", async (data: { roomId: string, page: BoardPage }) => {
      const roomState = getRoom(data.roomId);
      if (!roomState) return;
      
      roomState.gameState.page = data.page;
      setRoom(data.roomId, roomState);

      socket.to(data.roomId).emit("page_changed", data.page);
    });

    // select clue, change to clue page, and update visited celss event
    socket.on("select_clue", async (data: { roomId: string, cellId: string }) => {
      const roomState = getRoom(data.roomId);
      if (!roomState) return;

      roomState.gameState.page = 'CLUE';
      roomState.gameState.cellId = data.cellId;
      roomState.gameState.visitedCells.push(data.cellId);
      setRoom(data.roomId, roomState);

      socket.to(data.roomId).emit("clue_selected", data.cellId);
    });

    // change clue page event
    socket.on("change_clue_page", async (data: { roomId: string, index: number }) => {
      const roomState = getRoom(data.roomId);
      if (!roomState) return;

      roomState.gameState.cluePageIdx = data.index;
      setRoom(data.roomId, roomState);

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
    socket.on("disconnect", async (reason) => {
      console.log('[socket] Client disconnected:', {
        socketId: socket.id,
        reason,
      });
      const playerInfo = getPlayerInfo(socket.id);
      if (!playerInfo) return;

      const roomState = getRoom(playerInfo.roomId);
      if (!roomState || !roomState.players[playerInfo.userId]) return;

      roomState.players[playerInfo.userId].isConnected = false;
      setRoom(playerInfo.roomId, roomState);

      delPlayerInfo(socket.id);
      broadcastPlayersUpdates(playerInfo.roomId, roomState);
    });
  });

  return io;
};

export default initSocket;