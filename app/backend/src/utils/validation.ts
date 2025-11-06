import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const addToCartSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
});

export const restockSchema = z.object({
  delta: z.number().int('Delta must be an integer'),
});
