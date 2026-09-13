import 'dotenv/config';
import http from 'http';
import app from './app';
import initSocket from './utils/socket';

const port = process.env.PORT || 8001;
const server = http.createServer(app);

server.on('upgrade', (request) => {
  console.log('[http-upgrade] Request:', {
    url: request.url,
    origin: request.headers.origin ?? 'none',
    upgrade: request.headers.upgrade ?? 'none',
    connection: request.headers.connection ?? 'none',
  });
});

console.log('[startup] NODE_ENV:', process.env.NODE_ENV ?? 'undefined');
console.log('[startup] PORT:', port);
console.log('[startup] CLIENT_URL:', process.env.CLIENT_URL ?? 'undefined');
console.log('[startup] Initializing Socket.IO');

initSocket(server).then(() => {
  server.listen(port, () => {
    console.log(`[startup] HTTP and WebSocket server listening on port ${port}`);
  });
}).catch((error) => {
  console.error('[startup] Failed to initialize server:', error);
  process.exit(1);
});