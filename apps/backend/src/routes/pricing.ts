import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import prisma from '../prisma';
import { logAudit } from '../utils/audit';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('Admin'));

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
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { product_name, channel, price, region } = req.body;
    
    const rule = await prisma.pricingRule.create({
      data: {
        product_name,
        channel,
        price: parseFloat(price),
        region: region || 'Global'
      }
    });

    await logAudit(req.user!.id, `Created Pricing Rule for ${product_name} on ${channel} (Region: ${rule.region}, Price: $${rule.price})`);
    res.json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/pricing/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const ruleId = req.params.id as string;
    const { price, status, region } = req.body;

    const rule = await prisma.pricingRule.update({
      where: { id: ruleId },
      data: {
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(status !== undefined && { status: status as any }),
        ...(region !== undefined && { region })
      }
    });

    await logAudit(req.user!.id, `Updated Pricing Rule ${rule.id} (Price: ${rule.price}, Status: ${rule.status}, Region: ${rule.region})`);
    res.json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/pricing/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const ruleId = req.params.id as string;
    await prisma.pricingRule.delete({ where: { id: ruleId } });
    await logAudit(req.user!.id, `Deleted Pricing Rule ${ruleId}`);
    res.json({ success: true, message: 'Pricing rule deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
