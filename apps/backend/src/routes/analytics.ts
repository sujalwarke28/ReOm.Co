import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth';
import prisma from '../prisma';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('Admin', 'Manager', 'Executive'));

// GET /api/analytics/tasks
router.get('/tasks', async (req: Request, res: Response) => {
  try {
    const tasksAgg = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    
    // Format for Chart.js
    const labels = tasksAgg.map((t: any) => t.status);
    const data = tasksAgg.map((t: any) => t._count.id);
    
    res.json({ success: true, data: { labels, data } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/approvals
router.get('/approvals', async (req: Request, res: Response) => {
  try {
    const approvalsAgg = await prisma.approval.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const labels = approvalsAgg.map((a: any) => a.status);
    const data = approvalsAgg.map((a: any) => a._count.id);
    
    res.json({ success: true, data: { labels, data } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/departments (Mock using Roles)
router.get('/departments', async (req: Request, res: Response) => {
  try {
    // In a real scenario, this might join with User's department.
    // For this design, we aggregate tasks by the role of the creator.
    const users = await prisma.user.findMany({ include: { _count: { select: { tasks_created: true } } } });
    
    const roleMap: Record<string, number> = {};
    users.forEach((u: any) => {
      roleMap[u.role] = (roleMap[u.role] || 0) + u._count.tasks_created;
    });

    const labels = Object.keys(roleMap);
    const data = Object.values(roleMap);

    res.json({ success: true, data: { labels, data } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
