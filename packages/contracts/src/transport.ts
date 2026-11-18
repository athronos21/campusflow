import { z } from 'zod';

export const SearchTripsQuerySchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  campusId: z.string().uuid().optional(),
  date: z.string().optional(),
});

export type SearchTripsQuery = z.infer<typeof SearchTripsQuerySchema>;

export const CreateTicketReservationSchema = z.object({
  tripId: z.string().uuid(),
  seatNumber: z.number().int().positive(),
  passengerName: z.string().min(2),
  passengerPhone: z.string().min(9),
  paymentProvider: z.enum(['telebirr', 'cbe_birr', 'cash_at_station']).default('telebirr'),
});

export type CreateTicketReservationDto = z.infer<typeof CreateTicketReservationSchema>;

export interface TransportOperatorDto {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
}

export interface TransportRouteDto {
  id: string;
  origin: string;
  destination: string;
  departureStation: string;
  arrivalStation: string;
  distanceKm?: number | null;
  estimatedDurationMin?: number | null;
}

export interface TripDto {
  id: string;
  operator: TransportOperatorDto;
  route: TransportRouteDto;
  vehicleNumber: string;
  vehicleType: string;
  departureTime: string;
  arrivalTime?: string | null;
  totalSeats: number;
  availableSeats: number;
  priceMinor: string;
  currency: string;
  status: string;
}

export interface TicketReservationDto {
  id: string;
  tripId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  seatNumber: number;
  qrCode: string;
  amountMinor: string;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  trip?: TripDto;
}
