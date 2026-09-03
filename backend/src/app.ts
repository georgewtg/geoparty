import express from 'express';
import cors from 'cors';
// import path from 'path';
import cookieParser from 'cookie-parser';
import accountRouter from './routes/account.router';
import boardRouter from './routes/board.router';
import uploadRouter from './routes/upload.router';
import assetRouter from './routes/asset.router';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
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