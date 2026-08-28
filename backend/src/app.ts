import express from 'express';
import cors from 'cors';
import path from 'path';
import boardRouter from './routes/board.router';
import uploadRouter from './routes/upload.router';

const app = express();

app.use(cors());
app.use(express.json());

// for frontend rendering
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

// Mount Routes
app.use('/api/board', boardRouter);
app.use('/api/upload', uploadRouter)


export default app;