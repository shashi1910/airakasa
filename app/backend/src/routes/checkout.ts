import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { checkoutRateLimit } from '../middleware/rateLimit.js';
import * as checkoutService from '../services/checkoutService.js';
import * as cartService from '../services/cartService.js';

const router = Router();

router.post('/', checkoutRateLimit, async (req: AuthRequest, res: Response) => {
  try {
    const result = await checkoutService.processCheckout(req.userId!);
    
    if (result.status === 'SUCCESS') {
      res.json({
        status: 'SUCCESS',
        orderId: result.orderId,
        totalInPaise: result.totalInPaise,
      });
    } else {
      res.status(400).json({
        status: 'PARTIAL_FAIL',
        issues: result.issues,
      });
    }
  } catch (error: any) {
    if (error.message === 'Cart is empty') {
      return res.status(400).json({
        error: {
          code: 'EMPTY_CART',
          message: 'Cart is empty',
        },
      });
    }
    
    // Return a more detailed error message
    return res.status(500).json({
      error: {
        code: 'CHECKOUT_ERROR',
        message: error.message || 'Checkout failed. Please try again.',
      },
    });
  }
});

export default router;
