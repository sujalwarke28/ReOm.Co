import { Router, Request, Response } from 'express';
import si from 'systeminformation';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import prisma from '../prisma';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('Admin', 'Executive'));

// GET /api/monitoring/metrics
router.get('/metrics', async (req: AuthRequest, res: Response) => {
  try {
    const load = await si.currentLoad();
    const mem = await si.mem();
    const fsSize = await si.fsSize();
    
    // Aggregate storage usage from all mounted disks
    let totalStorage = 0;
    let usedStorage = 0;
    fsSize.forEach(disk => {
      totalStorage += disk.size;
      usedStorage += disk.used;
    });
    const storageUsage = totalStorage > 0 ? (usedStorage / totalStorage) * 100 : 0;

    const metrics = {
      cpuUsage: load.currentLoad,
      memoryUsage: (mem.active / mem.total) * 100,
      storageUsage,
      applicationHealth: 'Healthy',
    };

    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/monitoring/alerts
router.get('/alerts', async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    res.json({ success: true, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
