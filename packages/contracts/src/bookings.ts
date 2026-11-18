import { z } from 'zod';

export const CreateBookingSchema = z.object({
  businessId: z.string().uuid(),
  serviceName: z.string().min(2).max(100),
  startsAt: z.string().datetime(),
});

export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;

export const UpdateBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled', 'rejected']),
});

export type UpdateBookingStatusDto = z.infer<typeof UpdateBookingStatusSchema>;
