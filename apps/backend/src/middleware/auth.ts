import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token', error: err.message });
      }

      req.user = user as { id: string; role: string };
      next();
    });
  } else {
    res.status(401).json({ success: false, message: 'Authorization header missing' });
  }
};
