import { apiClient } from './client';

export interface Category {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  priceInPaise: number;
  stock: number;
  categoryId: string;
  imageUrl: string | null;
  category: Category;
}

export interface ItemsResponse {
  items: Item[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient('/api/categories');
    return response.json();
  },

  getItems: async (params?: {
    categoryId?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<ItemsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.q) searchParams.set('q', params.q);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const response = await apiClient(`/api/items?${searchParams.toString()}`);
    return response.json();
  },

  getItem: async (id: string): Promise<Item> => {
    const response = await apiClient(`/api/items/${id}`);
    return response.json();
  },
};
