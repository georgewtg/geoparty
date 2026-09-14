import express from 'express';
import cors from 'cors';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ?? '').split(',')
].map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin: (requestOrigin, callback) => {
    console.log('[http-cors] Request origin:', requestOrigin ?? 'none');
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
      callback(null, true);
      return;
    }

    console.warn('[http-cors] Rejected origin:', requestOrigin);
    callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'socket',
  });
});

export default app;