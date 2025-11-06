import { apiClient } from './client';

export interface CheckoutSuccess {
  status: 'SUCCESS';
  orderId: string;
  totalInPaise: number;
}

export interface CheckoutIssue {
  itemId: string;
  requested: number;
  available: number;
  reason: string;
}

export interface CheckoutFailure {
  status: 'PARTIAL_FAIL';
  issues: CheckoutIssue[];
}

export type CheckoutResponse = CheckoutSuccess | CheckoutFailure;

export const checkoutApi = {
  checkout: async (): Promise<CheckoutResponse> => {
    const response = await apiClient('/api/checkout', {
      method: 'POST',
    });
    return response.json();
  },
};
