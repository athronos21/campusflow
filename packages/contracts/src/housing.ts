import { z } from 'zod';

export const CreateHousingListingSchema = z.object({
  campusId: z.string().uuid(),
  title: z.string().min(5),
  description: z.string().optional(),
  location: z.string().min(3),
  propertyType: z.enum(['room', 'apartment', 'shared_house']).default('room'),
  rentMinor: z.union([z.string(), z.number()]),
  currency: z.string().default('ETB'),
  hasWater: z.boolean().default(true),
  hasElectricity: z.boolean().default(true),
  hasWifi: z.boolean().default(false),
  contactPhone: z.string().min(9),
  imageUrl: z.string().optional(),
});

export type CreateHousingListingDto = z.infer<typeof CreateHousingListingSchema>;

export const RequestHousingViewingSchema = z.object({
  listingId: z.string().uuid(),
  preferredDate: z.string(),
  studentPhone: z.string().min(9),
  message: z.string().optional(),
});

export type RequestHousingViewingDto = z.infer<typeof RequestHousingViewingSchema>;

export interface HousingListingDto {
  id: string;
  campusId: string;
  landlordId: string;
  title: string;
  description?: string | null;
  location: string;
  propertyType: string;
  rentMinor: string;
  currency: string;
  hasWater: boolean;
  hasElectricity: boolean;
  hasWifi: boolean;
  contactPhone: string;
  isAvailable: boolean;
  imageUrl?: string | null;
  createdAt: string;
  landlord?: {
    displayName: string;
    phone?: string | null;
    email?: string | null;
  };
}

export interface HousingViewingRequestDto {
  id: string;
  listingId: string;
  studentId: string;
  preferredDate: string;
  studentPhone: string;
  message?: string | null;
  status: string;
  createdAt: string;
  listing?: HousingListingDto;
}
