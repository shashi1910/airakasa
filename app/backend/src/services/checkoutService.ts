import prisma from '../utils/prisma.js';

interface CheckoutIssue {
  itemId: string;
  requested: number;
  available: number;
  reason: string;
}

export const processCheckout = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    // Get cart with items
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Check stock availability - fetch all items first, then validate
    const issues: CheckoutIssue[] = [];
    const itemChecks = await Promise.all(
      cart.items.map(async (cartItem) => {
        // Fetch item within transaction (transaction provides isolation)
        const item = await tx.item.findUnique({
          where: { id: cartItem.itemId },
        });

        if (!item) {
          issues.push({
            itemId: cartItem.itemId,
            requested: cartItem.quantity,
            available: 0,
            reason: 'NOT_AVAILABLE',
          });
          return null;
        }

        // Check stock availability
        if (item.stock < cartItem.quantity) {
          issues.push({
            itemId: cartItem.itemId,
            requested: cartItem.quantity,
            available: item.stock,
            reason: 'NOT_AVAILABLE',
          });
          return null;
        }

        return { cartItem, item, currentStock: item.stock };
      })
    );

    // If any issues, abort transaction
    if (issues.length > 0) {
      return {
        status: 'PARTIAL_FAIL' as const,
        issues,
      };
    }

    // All items available - proceed with checkout
    const validItems = itemChecks.filter((item): item is NonNullable<typeof item> => item !== null);
    
    // Calculate total
    const totalInPaise = validItems.reduce(
      (sum, { cartItem, item }) => sum + cartItem.quantity * item.priceInPaise,
      0
    );

    // Create order
    const order = await tx.order.create({
      data: {
        userId,
        totalInPaise,
        status: 'PLACED',
        items: {
          create: validItems.map(({ cartItem, item }) => ({
            itemId: item.id,
            quantity: cartItem.quantity,
            unitPriceInPaise: item.priceInPaise,
          })),
        },
      },
    });

    // Deduct stock and log inventory changes
    await Promise.all(
      validItems.map(async ({ cartItem, item, currentStock }) => {
        const newStock = currentStock - cartItem.quantity;
        
        await tx.item.update({
          where: { id: item.id },
          data: { stock: newStock },
        });

        await tx.inventoryLog.create({
          data: {
            itemId: item.id,
            delta: -cartItem.quantity,
            reason: 'ORDER_CHECKOUT',
            orderId: order.id,
          },
        });
      })
    );

    // Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return {
      status: 'SUCCESS' as const,
      orderId: order.id,
      totalInPaise,
    };
  });
};
