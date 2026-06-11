import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma';

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
  // JWTs are stateless. To truly revoke, we'd need a blacklist in Redis or DB.
  // For standard JWT implementation, we just tell the client to discard the token.
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
