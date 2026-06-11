import { Router, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import prisma from '../prisma';
import { logAudit } from '../utils/audit';

const router = Router();

router.use(authenticateJWT);

// GET /api/tasks
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id;
    
    let tasks;
    if (userRole === 'Admin' || userRole === 'Manager') {
      tasks = await prisma.task.findMany({ include: { assignee: true, creator: true } });
    } else {
      tasks = await prisma.task.findMany({
        where: { OR: [{ assigned_to: userId }, { created_by: userId }] },
        include: { assignee: true, creator: true }
      });
    }

    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tasks
router.post('/', authorizeRoles('Admin', 'Manager', 'OperationalStaff'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, assigned_to } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        assigned_to: assigned_to || null,
        created_by: req.user!.id,
      }
    });

    await logAudit(req.user!.id, `Created task ${task.id}`);
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id as string;
    const { status, title, description, assigned_to } = req.body;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { 
        status: status as any, 
        title, 
        description, 
        assigned_to: assigned_to as string 
      }
    });

    await logAudit(req.user!.id, `Updated task ${task.id} (Status: ${status})`);
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authorizeRoles('Admin'), async (req: AuthRequest, res: Response) => {
  try {
    const taskId = req.params.id as string;
    await prisma.task.delete({ where: { id: taskId } });
    await logAudit(req.user!.id, `Deleted task ${taskId}`);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
