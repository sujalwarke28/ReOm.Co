import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import prisma from '../prisma';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('Executive'));

// GET /api/executive/summary
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeTasks = await prisma.task.count({ where: { status: 'Pending' } });
    const completedTasks = await prisma.task.count({ where: { status: 'Completed' } });
    const totalApprovals = await prisma.approval.count();
    const approvedRequests = await prisma.approval.count({ where: { status: 'Approved' } });
    
    // Recent Operational Insights: Audit Log Volume
    const recentAuditLogs = await prisma.auditLog.count({
      where: {
        timestamp: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days
        }
      }
    });

    res.json({
      success: true,
      data: {
        organization: {
          totalUsers,
          activeDepartments: 4, // Mock static value
        },
        kpis: {
          activeTasks,
          completedTasks,
          taskCompletionRate: (completedTasks / (activeTasks + completedTasks || 1)) * 100,
          totalApprovals,
          approvedRequests,
        },
        insights: {
          recentActivityVolume: recentAuditLogs,
          systemHealth: 'Optimal',
        },
        trends: {
          // Mock data for trend analysis chart
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          growth: [10, 25, 45, 80],
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
