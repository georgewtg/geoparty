import express from 'express';
import cors from 'cors';
import gameRouter from './routes/game.router';

const app = express();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/game', gameRouter);


export default app;