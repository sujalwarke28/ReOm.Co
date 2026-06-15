import { Router, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { logAudit } from '../utils/audit';
import { pushNotification } from './notifications';

const router = Router();

router.use(authenticateJWT);

// GET /api/approvals
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id;
    
    const approvals = userRole === 'Admin'
      ? await prisma.approval.findMany({ include: { submitter: true, approver: true, requestee: true } })
      : await prisma.approval.findMany({
          where: { OR: [{ submitted_by: userId }, { requested_from: userId }] },
          include: { submitter: true, approver: true, requestee: true }
        });

    res.json({ success: true, data: approvals });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/approvals
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { request_title, requested_from } = req.body;
    
    if (requested_from) {
      const requestee = await prisma.user.findUnique({ where: { id: requested_from } });
      if (!requestee) {
        res.status(400).json({ success: false, message: 'Requested user not found' });
        return;
      }
      const userRole = req.user!.role;
      if (userRole === 'OperationalStaff' && !['Executive', 'Manager'].includes(requestee.role)) {
        res.status(403).json({ success: false, message: 'Ops can only request from Exec and Manager' });
        return;
      }
      if (userRole === 'Manager' && !['Executive', 'Admin'].includes(requestee.role)) {
        res.status(403).json({ success: false, message: 'Manager can only request from Exec and Admin' });
        return;
      }
      if (userRole === 'Executive' && requestee.role !== 'Admin') {
        res.status(403).json({ success: false, message: 'Executive can only request from Admin' });
        return;
      }
    }

    const approval = await prisma.approval.create({
      data: {
        request_title,
        submitted_by: req.user!.id,
        requested_from: requested_from || null,
      }
    });

    if (requested_from) {
      pushNotification(requested_from, { type: 'APPROVAL', message: `New approval requested: ${request_title}` });
    }

    await logAudit(req.user!.id, `Submitted approval request ${approval.id}`);
    res.json({ success: true, data: approval });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/approvals/:id/approve
router.put('/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const approvalId = req.params.id as string;
    
    const approvalRecord = await prisma.approval.findUnique({ where: { id: approvalId } });
    if (!approvalRecord) {
        res.status(404).json({ success: false, message: 'Approval not found' });
        return;
    }
    
    if (req.user!.role !== 'Admin' && approvalRecord.requested_from !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Not authorized to approve this request' });
        return;
    }

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
router.put('/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const approvalId = req.params.id as string;

    const approvalRecord = await prisma.approval.findUnique({ where: { id: approvalId } });
    if (!approvalRecord) {
        res.status(404).json({ success: false, message: 'Approval not found' });
        return;
    }
    
    if (req.user!.role !== 'Admin' && approvalRecord.requested_from !== req.user!.id) {
        res.status(403).json({ success: false, message: 'Not authorized to reject this request' });
        return;
    }

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
