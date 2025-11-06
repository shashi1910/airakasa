import prisma from '../utils/prisma.js';

export const getOrCreateCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  return cart;
};

export const addToCart = async (userId: string, itemId: string, quantity: number) => {
  // Check item exists and has stock
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_itemId: {
        cartId: cart.id,
        itemId,
      },
    },
  });

  const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

  // Validate stock availability
  if (newQuantity > item.stock) {
    throw new Error(
      `Insufficient stock. Available: ${item.stock}, Requested: ${newQuantity}`
    );
  }

  if (existingItem) {
    // Merge: add to existing quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: newQuantity,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        itemId,
        quantity,
      },
    });
  }

  return getOrCreateCart(userId);
};

export const updateCartItem = async (userId: string, itemId: string, quantity: number) => {
  if (quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }

  // Check item exists and has stock if quantity > 0
  if (quantity > 0) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    if (quantity > item.stock) {
      throw new Error(
        `Insufficient stock. Available: ${item.stock}, Requested: ${quantity}`
      );
    }
  }

  const cart = await getOrCreateCart(userId);

  if (quantity === 0) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        itemId,
      },
    });
  } else {
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_itemId: {
          cartId: cart.id,
          itemId,
        },
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          itemId,
          quantity,
        },
      });
    }
  }

  return getOrCreateCart(userId);
};

export const removeFromCart = async (userId: string, itemId: string) => {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      itemId,
    },
  });

  return getOrCreateCart(userId);
};

export const clearCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
};
