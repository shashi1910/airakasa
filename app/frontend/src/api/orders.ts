import { apiClient } from './client';
import { Item } from './catalog';

export type OrderStatus = 'PLACED' | 'DELIVERED';

export interface OrderItem {
  id: string;
  orderId: string;
  itemId: string;
  item: Item;
  quantity: number;
  unitPriceInPaise: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalInPaise: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient('/api/orders');
    return response.json();
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await apiClient(`/api/orders/${id}`);
    return response.json();
  },
};
