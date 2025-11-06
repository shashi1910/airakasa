import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import * as orderService from '../services/orderService.js';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const orders = await orderService.getUserOrders(req.userId!);
    res.json(orders);
  } catch (error) {
    throw error;
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id, req.userId!);

    if (!order) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    res.json(order);
  } catch (error) {
    throw error;
  }
});

export default router;
