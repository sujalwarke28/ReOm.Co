import { Router, Response, Request } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// In-memory store for active SSE connections
interface ClientConnection {
  res: Response;
  userId?: string;
  email?: string;
  role?: string;
}

const activeConnections: ClientConnection[] = [];

// Helper to push to a user ID
export const pushNotification = (userId: string, payload: { type: string, message: string }) => {
  const data = JSON.stringify(payload);
  activeConnections
    .filter(c => c.userId === userId)
    .forEach(c => {
      try {
        c.res.write(`data: ${data}\n\n`);
      } catch (err) {
        // connection might have closed
      }
    });
};

// Helper to push to an email
export const pushNotificationToEmail = (email: string, payload: { type: string, message: string }) => {
  const data = JSON.stringify(payload);
  activeConnections
    .filter(c => c.email?.toLowerCase() === email.toLowerCase())
    .forEach(c => {
      try {
        c.res.write(`data: ${data}\n\n`);
      } catch (err) {
        // connection might have closed
      }
    });
};

// Helper to push to all Admins
export const pushNotificationToAdmins = (payload: { type: string, message: string }) => {
  const data = JSON.stringify(payload);
  activeConnections
    .filter(c => c.role === 'Admin')
    .forEach(c => {
      try {
        c.res.write(`data: ${data}\n\n`);
      } catch (err) {
        // connection might have closed
      }
    });
};

// GET /api/notifications/stream
router.get('/stream', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string;
  const emailParam = req.query.email as string;

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1] || '';
  } else if (queryToken) {
    token = queryToken;
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable NGINX proxy buffering
  res.flushHeaders(); // Tell the client to expect an ongoing stream

  const connection: ClientConnection = { res };

  const handleConnection = () => {
    activeConnections.push(connection);
    
    // Send initial ping
    res.write(`data: ${JSON.stringify({ type: 'PING', message: 'Connected to notifications' })}\n\n`);

    // Clean up when connection closes
    req.on('close', () => {
      const idx = activeConnections.indexOf(connection);
      if (idx !== -1) {
        activeConnections.splice(idx, 1);
      }
    });
  };

  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (!err && decoded) {
        connection.userId = decoded.id;
        connection.role = decoded.role;
      }
      if (emailParam) {
        connection.email = emailParam;
      }
      handleConnection();
    });
  } else {
    if (emailParam) {
      connection.email = emailParam;
    }
    handleConnection();
  }
});

export default router;
