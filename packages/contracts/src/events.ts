import { z } from 'zod';

export const CreateCampusEventSchema = z.object({
  campusId: z.string().uuid(),
  title: z.string().min(5),
  description: z.string().min(10),
  venue: z.string().min(3),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  category: z.string().default('Campus Life'),
  entryFeeMinor: z.union([z.string(), z.number()]).default(0),
  currency: z.string().default('ETB'),
  maxAttendees: z.number().int().positive().optional(),
  bannerUrl: z.string().optional(),
});

export type CreateCampusEventDto = z.infer<typeof CreateCampusEventSchema>;

export interface CampusEventDto {
  id: string;
  campusId: string;
  organizerId: string;
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  endsAt?: string | null;
  category: string;
  entryFeeMinor: string;
  currency: string;
  maxAttendees?: number | null;
  bannerUrl?: string | null;
  createdAt: string;
  organizer?: {
    displayName: string;
    email?: string | null;
  };
  _count?: {
    rsvps: number;
  };
}

export interface EventRsvpDto {
  id: string;
  eventId: string;
  userId: string;
  ticketCode: string;
  status: string;
  createdAt: string;
  event?: CampusEventDto;
}
