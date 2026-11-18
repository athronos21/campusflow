import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchTripsQueryDto, CreateTicketReservationDto } from './dto/transport.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class TransportService {
  constructor(private prisma: PrismaService) {}

  async getRoutes(campusId?: string) {
    return this.prisma.transportRoute.findMany({
      where: {
        isActive: true,
        ...(campusId ? { campusId } : {}),
      },
      include: {
        campus: {
          select: { id: true, name: true, city: true },
        },
      },
      orderBy: { origin: 'asc' },
    });
  }

  async searchTrips(query: SearchTripsQueryDto) {
    const whereClause: any = {
      status: 'scheduled',
      departureTime: {
        gte: new Date(),
      },
    };

    if (query.origin || query.destination || query.campusId) {
      whereClause.route = {};
      if (query.origin) {
        whereClause.route.origin = { contains: query.origin, mode: 'insensitive' };
      }
      if (query.destination) {
        whereClause.route.destination = { contains: query.destination, mode: 'insensitive' };
      }
      if (query.campusId) {
        whereClause.route.campusId = query.campusId;
      }
    }

    if (query.date) {
      const startOfDay = new Date(query.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(query.date);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.departureTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const trips = await this.prisma.trip.findMany({
      where: whereClause,
      include: {
        operator: true,
        route: true,
      },
      orderBy: { departureTime: 'asc' },
    });

    return trips.map((trip) => ({
      ...trip,
      priceMinor: trip.priceMinor.toString(),
    }));
  }

  async getTripById(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        operator: true,
        route: true,
        reservations: {
          where: {
            status: { in: ['reserved', 'confirmed'] },
          },
          select: {
            seatNumber: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    const occupiedSeats = trip.reservations.map((r) => r.seatNumber);

    return {
      ...trip,
      priceMinor: trip.priceMinor.toString(),
      occupiedSeats,
    };
  }

  async createReservation(userId: string, dto: CreateTicketReservationDto) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id: dto.tripId },
        include: { route: true, operator: true },
      });

      if (!trip) {
        throw new NotFoundException('Trip not found');
      }

      if (trip.status !== 'scheduled') {
        throw new BadRequestException('Trip is not available for booking');
      }

      if (dto.seatNumber > trip.totalSeats || dto.seatNumber < 1) {
        throw new BadRequestException(`Seat number must be between 1 and ${trip.totalSeats}`);
      }

      // Check if seat is already reserved
      const existingSeat = await tx.ticketReservation.findFirst({
        where: {
          tripId: dto.tripId,
          seatNumber: dto.seatNumber,
          status: { in: ['reserved', 'confirmed'] },
        },
      });

      if (existingSeat) {
        throw new ConflictException(`Seat ${dto.seatNumber} is already occupied on this trip`);
      }

      if (trip.availableSeats <= 0) {
        throw new BadRequestException('No seats remaining on this trip');
      }

      // Generate verifiable QR code token
      const qrCode = `CF-TRIP-${trip.id.slice(0, 8)}-S${dto.seatNumber}-${randomBytes(4).toString('hex').toUpperCase()}`;

      // Create reservation
      const reservation = await tx.ticketReservation.create({
        data: {
          tripId: trip.id,
          passengerId: userId,
          seatNumber: dto.seatNumber,
          passengerName: dto.passengerName,
          passengerPhone: dto.passengerPhone,
          amountMinor: trip.priceMinor,
          currency: trip.currency,
          status: 'reserved',
          paymentStatus: dto.paymentProvider === 'cash_at_station' ? 'unpaid' : 'pending',
          qrCode,
        },
        include: {
          trip: {
            include: { operator: true, route: true },
          },
        },
      });

      // Decrement available seats
      await tx.trip.update({
        where: { id: trip.id },
        data: {
          availableSeats: { decrement: 1 },
        },
      });

      return {
        ...reservation,
        amountMinor: reservation.amountMinor.toString(),
        trip: {
          ...reservation.trip,
          priceMinor: reservation.trip.priceMinor.toString(),
        },
      };
    });
  }

  async getUserReservations(userId: string) {
    const reservations = await this.prisma.ticketReservation.findMany({
      where: { passengerId: userId },
      include: {
        trip: {
          include: { operator: true, route: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reservations.map((r) => ({
      ...r,
      amountMinor: r.amountMinor.toString(),
      trip: {
        ...r.trip,
        priceMinor: r.trip.priceMinor.toString(),
      },
    }));
  }

  async cancelReservation(userId: string, reservationId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.ticketReservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }

      if (reservation.passengerId !== userId) {
        throw new BadRequestException('Not authorized to cancel this reservation');
      }

      if (reservation.status === 'cancelled') {
        throw new BadRequestException('Reservation is already cancelled');
      }

      const updated = await tx.ticketReservation.update({
        where: { id: reservationId },
        data: { status: 'cancelled' },
      });

      await tx.trip.update({
        where: { id: reservation.tripId },
        data: {
          availableSeats: { increment: 1 },
        },
      });

      return {
        ...updated,
        amountMinor: updated.amountMinor.toString(),
      };
    });
  }
}
