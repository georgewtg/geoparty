import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as accountService from '../services/account.service'
import { clearAuthCookie, setAuthCookie } from '../utils/cookie';


export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const isValid = await accountService.fetchAccountEmailUsername(email, username);
    if (!isValid) return res.status(409).json({ success: false, message: 'Email or Username already exists' });

    const user = await accountService.registerAccount(email, username, password);
    if (!user) return res.status(400).json({ success: false, message: 'Failed to register account' });

    setAuthCookie(res, user.id);
    return res.status(201).json({ success: true, payload: user });
    
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email_or_username, password } = req.body;
    if (!email_or_username || !password) {
      return res.status(400).json({ success: false, message: 'Credentials are required' });
    }

    const user = await accountService.loginAccount(email_or_username, password);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    setAuthCookie(res, user.id);
    res.status(200).json({ success: true, payload: user });
    
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    clearAuthCookie(res);
    res.status(200).json({ success: true, payload: null });
    
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const checkAuth = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(200).json({
        success: true,
        payload: { isAuthenticated: false, user: null }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await accountService.fetchAccount(decoded.userId);

    res.status(200).json({ success: true, payload: { isAuthenticated: true, user: user } });
    
  } catch (error) {
    res.status(200).json({ success: true, payload: { isAuthenticated: false, user: null } });
  }
};