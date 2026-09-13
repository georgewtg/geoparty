import express from 'express';
import cors from 'cors';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ?? '').split(',')
].map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());


export default app;