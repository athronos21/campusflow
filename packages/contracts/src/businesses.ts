import { z } from 'zod';

export const CreateBusinessSchema = z.object({
  campusId: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

export type CreateBusinessDto = z.infer<typeof CreateBusinessSchema>;

export const BusinessQuerySchema = z.object({
  campusId: z.string().uuid(),
  status: z.enum(['pending', 'verified', 'rejected', 'suspended']).optional().default('verified'),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});

export type BusinessQueryDto = z.infer<typeof BusinessQuerySchema>;
