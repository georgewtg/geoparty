import 'dotenv/config';
import http from 'http';
import app from './app';
import initSocket from './utils/socket';

const port = process.env.PORT || 8000;
const server = http.createServer(app);

async function startServer() {
  try {
    await initSocket(server);
    server.listen(port, () => {
      console.log(`Server and WebSocket running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

startServer();