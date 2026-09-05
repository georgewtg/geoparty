import { Response } from 'express';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'token';
const TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

export const setAuthCookie = (res: Response, value: string): void => {
  const token = jwt.sign({ userId: value }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: TIME,
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
};