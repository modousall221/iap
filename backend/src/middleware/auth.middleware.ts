import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';
import type { JWTPayload } from '../types/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const verifyRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} to role ${roles.join(',')}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const verifyKYC = (req: Request, res: Response, next: NextFunction) => {
  // Will be implemented when KYC module is added
  next();
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
