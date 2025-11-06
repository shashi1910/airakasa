import { apiClient } from './client';
import { Item } from './catalog';

export interface CartItem {
  id: string;
  cartId: string;
  itemId: string;
  item: Item;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient('/api/cart');
    return response.json();
  },

  addToCart: async (itemId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ itemId, quantity }),
    });
    return response.json();
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient(`/api/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  },

  removeFromCart: async (itemId: string): Promise<Cart> => {
    const response = await apiClient(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
