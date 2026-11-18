import { z } from 'zod';

export const CreateProductSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  priceMinor: z.coerce.number().int().nonnegative('Price cannot be negative'),
  currency: z.string().length(3).default('ETB'),
  stockQuantity: z.number().int().nonnegative().optional(),
  isAvailable: z.boolean().default(true),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;

export const ProductQuerySchema = z.object({
  businessId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(30),
  cursor: z.string().uuid().optional(),
});

export type ProductQueryDto = z.infer<typeof ProductQuerySchema>;
