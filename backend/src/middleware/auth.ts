import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      roleId: decoded.roleId,
      role: decoded.role,
      stationId: decoded.stationId,
      regionId: decoded.regionId
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        roleId: decoded.roleId,
        role: decoded.role,
        stationId: decoded.stationId,
        regionId: decoded.regionId
      };
    } catch (error) {
      // Token invalid but optional, continue
    }
  }

  next();
};
