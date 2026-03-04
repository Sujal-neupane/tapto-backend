import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { JWT_SECRET } from '../config';

export const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // Fallback: allow cookie-based JWT for web clients
    if (!token) {
      const cookieToken = (req as any).cookies?.authToken;
      if (cookieToken) token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await UserModel.findById(decoded.id);

    const isAdmin = user?.role === 'admin' || decoded?.role === 'admin';

    if (!user || !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};