import bcrypt from 'bcrypt';
import { query } from "../db";


const hashPassword = async (password: string) => {
  const SALT_ROUNDS = 12;
  return await bcrypt.hash(password, SALT_ROUNDS);
}

const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};


export const fetchAccountEmailUsername = async (email: string, username: string): Promise<boolean> => {
  try {
    const result = await query(
      `SELECT id, email, username from users
      WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)`,
      [email, username]
    );

    if (result.rows.length === 0) return true;
    return false;

  } catch (error) {
    console.error("Error checking credentials:", error);
    throw error;
  }
};

export const registerAccount = async (
  email: string,
  username: string,
  password: string
) => {
  const hashedPassword = await hashPassword(password);

  try {
    const result = await query(
      `INSERT INTO users (email, username, password)
      VALUES ($1, $2, $3) RETURNING id, email, username`,
      [email, username, hashedPassword]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0].id;
    
  } catch (error) {
    console.error("Error inserting user data:", error);
    throw error;
  }
};

export const loginAccount = async (
  email_or_username: string,
  password: string
) => {
  try {
    const result = await query(
      `SELECT * FROM users
      WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)`,
      [email_or_username]
    );

    if (result.rows.length === 0) return null;
    
    const isPasswordValid = await comparePassword(password, result.rows[0].password);
    if (isPasswordValid) {
      const { password: _, ...userWithoutPassword } = result.rows[0];
      return userWithoutPassword;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};