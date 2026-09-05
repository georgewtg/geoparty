import dotenv from 'dotenv';
// import { Pool } from 'pg';
import { neonConfig, Pool } from '@neondatabase/serverless'
import ws from 'ws';

dotenv.config();

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   // max: 10,
//   // idleTimeoutMillis: 10000,
// });

neonConfig.webSocketConstructor = ws;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('error', (error: any) => {
  console.error('Unexpected error on database', error);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;