import { z } from 'zod';

export const CampusSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  city: z.string(),
  isActive: z.boolean(),
});

export type CampusDto = z.infer<typeof CampusSchema>;
