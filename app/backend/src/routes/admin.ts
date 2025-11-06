import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { isAdmin } from '../middleware/auth.js';
import { restockSchema } from '../utils/validation.js';
import prisma from '../utils/prisma.js';
import * as orderService from '../services/orderService.js';

const router = Router();

router.post('/orders/:id/deliver', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.markOrderDelivered(id);
    res.json(order);
  } catch (error) {
    throw error;
  }
});

router.post('/items/:id/restock', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { delta } = restockSchema.parse(req.body);

    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({
        error: {
          code: 'ITEM_NOT_FOUND',
          message: 'Item not found',
        },
      });
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        stock: item.stock + delta,
      },
    });

    await prisma.inventoryLog.create({
      data: {
        itemId: id,
        delta,
        reason: 'ADMIN_RESTOCK',
      },
    });

    res.json(updatedItem);
  } catch (error) {
    throw error;
  }
});

export default router;
