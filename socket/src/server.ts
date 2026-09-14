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

initSocket(server).then(() => {
  server.listen(port, () => {
    console.log(`[startup] HTTP and WebSocket server listening on port ${port}`);
  });
}).catch((error) => {
  console.error('[startup] Failed to initialize server:', error);
  process.exit(1);
});