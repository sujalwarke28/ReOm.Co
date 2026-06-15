import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma';
import { pushNotificationToAdmins } from './notifications';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Invalid input', error: parsed.error.issues });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
     }

    if (user.status === 'Pending') {
      return res.status(403).json({ success: false, message: 'Your registration is pending Admin approval.' });
    }

    if (user.status === 'Rejected') {
      return res.status(403).json({ success: false, message: 'Your registration has been rejected by the Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

const signupSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['Admin', 'Manager', 'OperationalStaff', 'Executive']).optional()
});

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Invalid input', error: parsed.error.issues });
    }

    const { username, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with email or username already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash,
        role: (role as any) || 'OperationalStaff',
        status: 'Pending'
      }
    });

    // Broadcast new registration request to Admins
    pushNotificationToAdmins({
      type: 'USER_REGISTERED',
      message: `New user registration request: ${username} (${role})`
    });

    res.json({ success: true, message: 'User created successfully', data: { id: user.id, email: user.email, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

import { authenticateJWT, AuthRequest } from '../middleware/auth';

router.get('/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { id: true, username: true, email: true, role: true, status: true, created_at: true }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status !== 'Approved') {
      return res.status(403).json({ success: false, message: `Access denied: account status is ${user.status}` });
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Update own username
router.put('/profile', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.body;
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters.' });
    }
    const existing = await prisma.user.findFirst({ where: { username: username.trim(), NOT: { id: req.user?.id } } });
    if (existing) return res.status(400).json({ success: false, message: 'That username is already taken.' });
    const updated = await prisma.user.update({
      where: { id: req.user?.id },
      data: { username: username.trim() },
      select: { id: true, username: true, email: true, role: true, created_at: true },
    });
    res.json({ success: true, message: 'Profile updated.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

export default router;
