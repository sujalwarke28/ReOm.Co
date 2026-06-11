import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import prisma from '../prisma';
import { logAudit } from '../utils/audit';

const router = Router();

router.use(authenticateJWT);

// GET /api/pricing
// Everyone can view pricing rules
router.get('/', async (req: Request, res: Response) => {
  try {
    const rules = await prisma.pricingRule.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: rules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/pricing
// Only Managers and Admins can create pricing rules
router.post('/', authorizeRoles('Manager', 'Admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { product_name, channel, price } = req.body;
    
    const rule = await prisma.pricingRule.create({
      data: {
        product_name,
        channel,
        price: parseFloat(price)
      }
    });

    await logAudit(req.user!.id, `Created Pricing Rule for ${product_name} on ${channel}`);
    res.json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/pricing/:id
// Only Managers and Admins can update prices
router.put('/:id', authorizeRoles('Manager', 'Admin'), async (req: AuthRequest, res: Response) => {
  try {
    const ruleId = req.params.id as string;
    const { price, status } = req.body;

    const rule = await prisma.pricingRule.update({
      where: { id: ruleId },
      data: {
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(status !== undefined && { status: status as any })
      }
    });

    await logAudit(req.user!.id, `Updated Pricing Rule ${rule.id} (Price: ${rule.price}, Status: ${rule.status})`);
    res.json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
