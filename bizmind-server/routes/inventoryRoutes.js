import express from 'express';
import Inventory from '../models/Inventory.js';
import { protect } from '../middleware/authMiddleware.js';
import { ok, fail } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const items = await Inventory.find({ businessId }).sort({ productName: 1 }).lean();

  const enriched = items.map((i) => {
    const quantity = i.quantity || 0;
    const unitCost = i.unitCost || 0;
    const reorderLevel = i.reorderLevel ?? null;
    return {
      ...i,
      inventoryValue: Number((quantity * unitCost).toFixed(2)),
      lowStock: reorderLevel != null ? quantity <= reorderLevel : false,
    };
  });

  return ok(res, 'Inventory retrieved.', {
    total: enriched.length,
    items: enriched,
  });
}));

router.get('/alerts', asyncHandler(async (req, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return fail(res, 'No business linked to this user.', 400);

  const items = await Inventory.find({ businessId, reorderLevel: { $ne: null } }).lean();
  const lowStock = items.filter((i) => (i.quantity || 0) <= (i.reorderLevel || 0));
  return ok(res, 'Inventory alerts retrieved.', { lowStock });
}));

export default router;