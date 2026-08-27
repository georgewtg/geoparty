import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // max: 10,
  // idleTimeoutMillis: 10000,
})

pool.on('error', (error) => {
  console.error('Unexpected error on idle PostgreSQL client', error);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;