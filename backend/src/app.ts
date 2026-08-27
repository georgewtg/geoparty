import express from 'express';
import cors from 'cors';
import boardRouter from './routes/board.router';

const app = express();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/board', boardRouter);


export default app;