import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import logger from '../config/logger.js';
import type { JWTPayload } from '../types/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
};

export const verifyRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} to role ${roles.join(',')}`);
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const verifyKYC = (_req: Request, _res: Response, next: NextFunction): void => {
  // Will be implemented when KYC module is added
  next();
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
