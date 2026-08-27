import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';

dotenv.config();

const port = process.env.PORT || 8000;
const server = http.createServer(app);
const io = new Server(server, { 
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room (sent from Board.tsx)
  socket.on('join-room', ({ roomId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('player-joined', { socketId: socket.id });
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Server and WebSocket running on port ${port}`);
});