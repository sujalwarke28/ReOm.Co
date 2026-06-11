import { Router, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import prisma from '../prisma';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('Admin'));

// GET /api/audit
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      include: {
        actor: {
          select: {
            username: true,
            email: true,
            role: true
          }
        }
      },
      take: 100 // Limit to recent 100 for performance in this MVP
    });

    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
