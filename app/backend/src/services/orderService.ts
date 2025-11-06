import prisma from '../utils/prisma.js';

export const getUserOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getOrderById = async (orderId: string, userId: string) => {
  return await prisma.order.findFirst({
    where: {
      id: orderId,
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
};

export const markOrderDelivered = async (orderId: string) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status: 'DELIVERED' },
  });
};
