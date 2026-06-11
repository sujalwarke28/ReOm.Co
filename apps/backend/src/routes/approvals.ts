import { Router, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import prisma from '../prisma';
import { logAudit } from '../utils/audit';

const router = Router();

router.use(authenticateJWT);

// GET /api/approvals
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id;
    
    let approvals;
    if (userRole === 'Admin' || userRole === 'Manager') {
      approvals = await prisma.approval.findMany({ include: { submitter: true, approver: true } });
    } else {
      approvals = await prisma.approval.findMany({
        where: { submitted_by: userId },
        include: { submitter: true, approver: true }
      });
    }

    res.json({ success: true, data: approvals });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/approvals
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { request_title } = req.body;
    const status = req.query.status as string;
    const userId = req.query.userId as string;
    const approval = await prisma.approval.create({
      data: {
        request_title,
        submitted_by: req.user!.id,
      }
    });

    await logAudit(req.user!.id, `Submitted approval request ${approval.id}`);
    res.json({ success: true, data: approval });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/approvals/:id/approve
router.put('/:id/approve', authorizeRoles('Admin', 'Manager'), async (req: AuthRequest, res: Response) => {
  try {
    const approvalId = req.params.id as string;
    const approval = await prisma.approval.update({
      where: { id: approvalId },
      data: { status: 'Approved', approved_by: req.user!.id }
    });

    await logAudit(req.user!.id, `Approved request ${approval.id}`);
    res.json({ success: true, data: approval });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/approvals/:id/reject
router.put('/:id/reject', authorizeRoles('Admin', 'Manager'), async (req: AuthRequest, res: Response) => {
  try {
    const approvalId = req.params.id as string;
    const approval = await prisma.approval.update({
      where: { id: approvalId },
      data: { status: 'Rejected', approved_by: req.user!.id }
    });

    await logAudit(req.user!.id, `Rejected request ${approval.id}`);
    res.json({ success: true, data: approval });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
