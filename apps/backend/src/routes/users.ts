import { Router, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import prisma from '../prisma';
import { pushNotificationToEmail } from './notifications';

const router = Router();

router.use(authenticateJWT);

// GET /api/users/assignable - Lightweight user list for task assignment dropdown
// Accessible to Admin, Executive, and Manager
router.get('/assignable', authorizeRoles('Admin', 'Executive', 'Manager'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { status: 'Approved' },
      select: {
        id: true,
        username: true,
        role: true,
      },
      orderBy: [{ role: 'asc' }, { username: 'asc' }]
    });

    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// All routes below are Admin only
router.use(authorizeRoles('Admin'));

// GET /api/users - List all users with full details (Admin only)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        _count: {
          select: {
            tasks_assigned: true,
            tasks_created: true,
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id/role - Change a user's role (Admin only)
router.put('/:id/role', async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { role } = req.body;

    const validRoles = ['Admin', 'Manager', 'OperationalStaff', 'Executive'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: { id: true, username: true, email: true, role: true }
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id/approve - Approve a pending user (Admin only)
router.put('/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = await prisma.user.update({
      where: { id },
      data: { status: 'Approved' },
      select: { id: true, username: true, email: true, role: true, status: true }
    });

    // Notify user via their registered email SSE connection
    pushNotificationToEmail(user.email, {
      type: 'REGISTRATION_APPROVED',
      message: 'Your registration has been approved by the Admin!'
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id/reject - Reject a user (Admin only)
router.put('/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const user = await prisma.user.update({
      where: { id },
      data: { status: 'Rejected' },
      select: { id: true, username: true, email: true, role: true, status: true }
    });

    // Notify user via their registered email SSE connection
    pushNotificationToEmail(user.email, {
      type: 'REGISTRATION_REJECTED',
      message: 'Your registration has been rejected by the Admin.'
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/users/:id - Remove a user (Admin only)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    // Prevent self-deletion
    if (id === req.user!.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User removed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
