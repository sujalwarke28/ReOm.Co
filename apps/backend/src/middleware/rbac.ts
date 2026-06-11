import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied: Insufficient permissions' });
    }

    next();
  };
};
