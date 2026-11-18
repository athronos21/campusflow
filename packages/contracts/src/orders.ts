import { z } from 'zod';

export const OrderItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const CreateOrderSchema = z.object({
  campusId: z.string().uuid(),
  businessId: z.string().uuid(),
  items: z.array(OrderItemInputSchema).min(1, 'Order must contain at least one item'),
  idempotencyKey: z.string().min(10).optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['accepted', 'preparing', 'ready', 'completed', 'cancelled', 'rejected']),
  reason: z.string().optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;
