import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { addToCartSchema, updateCartItemSchema } from '../utils/validation.js';
import * as cartService from '../services/cartService.js';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const cart = await cartService.getOrCreateCart(req.userId!);
    res.json(cart);
  } catch (error) {
    throw error;
  }
});

router.post('/items', async (req: AuthRequest, res: Response) => {
  try {
    const { itemId, quantity } = addToCartSchema.parse(req.body);
    const cart = await cartService.addToCart(req.userId!, itemId, quantity);
    res.json(cart);
  } catch (error: any) {
    if (error.message.includes('Insufficient stock') || error.message.includes('Item not found')) {
      return res.status(400).json({
        error: {
          code: 'STOCK_ERROR',
          message: error.message,
        },
      });
    }
    throw error;
  }
});

router.patch('/items/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { quantity } = updateCartItemSchema.parse(req.body);
    const cart = await cartService.updateCartItem(req.userId!, itemId, quantity);
    res.json(cart);
  } catch (error: any) {
    if (error.message.includes('Insufficient stock') || error.message.includes('Item not found') || error.message.includes('cannot be negative')) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }
    throw error;
  }
});

router.delete('/items/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const cart = await cartService.removeFromCart(req.userId!, itemId);
    res.json(cart);
  } catch (error) {
    throw error;
  }
});

export default router;
