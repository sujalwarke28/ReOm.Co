import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/kpis', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    
    const totalTasks = await prisma.task.count();
    const pendingTasks = await prisma.task.count({ where: { status: 'Pending' } });
    const completedTasks = await prisma.task.count({ where: { status: 'Completed' } });

    const totalApprovals = await prisma.approval.count();
    const pendingApprovals = await prisma.approval.count({ where: { status: 'Pending' } });
    const approvedRequests = await prisma.approval.count({ where: { status: 'Approved' } });

    res.json({
      success: true,
      data: {
        users: { total: totalUsers },
        tasks: {
          total: totalTasks,
          pending: pendingTasks,
          completed: completedTasks,
        },
        approvals: {
          total: totalApprovals,
          pending: pendingApprovals,
          approved: approvedRequests,
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

export default router;
