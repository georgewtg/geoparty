import express from 'express';
import cors from 'cors';
// import path from 'path';
import cookieParser from 'cookie-parser';
import accountRouter from './routes/account.router';
import boardRouter from './routes/board.router';
import uploadRouter from './routes/upload.router';
import assetRouter from './routes/asset.router';

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
app.use(cookieParser());

// // for frontend rendering
// app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

// Mount Routes
app.use('/api/account', accountRouter);
app.use('/api/board', boardRouter);
app.use('/api/upload', uploadRouter)
app.use('/api/asset', assetRouter);


export default app;