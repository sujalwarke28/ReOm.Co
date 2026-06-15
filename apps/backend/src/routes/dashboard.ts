import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/kpis', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id;

    let totalUsers = 0;
    let totalTasks = 0;
    let pendingTasks = 0;
    let completedTasks = 0;
    let totalApprovals = 0;
    let pendingApprovals = 0;
    let approvedRequests = 0;
    let recentTasks: any[] = [];
    let recentApprovals: any[] = [];

    if (userRole === 'Admin') {
      totalUsers = await prisma.user.count();
      totalTasks = await prisma.task.count();
      pendingTasks = await prisma.task.count({ where: { status: 'Pending' } });
      completedTasks = await prisma.task.count({ where: { status: 'Completed' } });
      totalApprovals = await prisma.approval.count();
      pendingApprovals = await prisma.approval.count({ where: { status: 'Pending' } });
      approvedRequests = await prisma.approval.count({ where: { status: 'Approved' } });

      recentTasks = await prisma.task.findMany({
        take: 3,
        orderBy: { created_at: 'desc' },
        include: {
          assignee: { select: { username: true } },
          creator: { select: { username: true } },
        },
      });

      recentApprovals = await prisma.approval.findMany({
        take: 3,
        orderBy: { created_at: 'desc' },
        include: {
          submitter: { select: { username: true } },
          requestee: { select: { username: true } },
        },
      });
    } else {
      // Non-admin: filter by logged-in user
      totalTasks = await prisma.task.count({
        where: { OR: [{ assigned_to: userId }, { created_by: userId }] }
      });
      pendingTasks = await prisma.task.count({
        where: { AND: [{ status: 'Pending' }, { OR: [{ assigned_to: userId }, { created_by: userId }] }] }
      });
      completedTasks = await prisma.task.count({
        where: { AND: [{ status: 'Completed' }, { OR: [{ assigned_to: userId }, { created_by: userId }] }] }
      });

      totalApprovals = await prisma.approval.count({
        where: { OR: [{ submitted_by: userId }, { approved_by: userId }, { requested_from: userId }] }
      });
      pendingApprovals = await prisma.approval.count({
        where: { AND: [{ status: 'Pending' }, { OR: [{ submitted_by: userId }, { approved_by: userId }, { requested_from: userId }] }] }
      });
      approvedRequests = await prisma.approval.count({
        where: { AND: [{ status: 'Approved' }, { OR: [{ submitted_by: userId }, { approved_by: userId }, { requested_from: userId }] }] }
      });

      recentTasks = await prisma.task.findMany({
        where: { OR: [{ assigned_to: userId }, { created_by: userId }] },
        take: 3,
        orderBy: { created_at: 'desc' },
        include: {
          assignee: { select: { username: true } },
          creator: { select: { username: true } },
        },
      });

      recentApprovals = await prisma.approval.findMany({
        where: { OR: [{ submitted_by: userId }, { approved_by: userId }, { requested_from: userId }] },
        take: 3,
        orderBy: { created_at: 'desc' },
        include: {
          submitter: { select: { username: true } },
          requestee: { select: { username: true } },
        },
      });
    }

    res.json({
      success: true,
      data: {
        users: { total: totalUsers },
        tasks: { total: totalTasks, pending: pendingTasks, completed: completedTasks },
        approvals: { total: totalApprovals, pending: pendingApprovals, approved: approvedRequests },
        recentTasks,
        recentApprovals,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

export default router;
