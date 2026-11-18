import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingStatusDto } from '@campusflow/contracts';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(customerId: string, dto: CreateBookingDto) {
    return this.prisma.booking.create({
      data: {
        customerId,
        businessId: dto.businessId,
        serviceName: dto.serviceName,
        startsAt: new Date(dto.startsAt),
        status: BookingStatus.requested,
      },
      include: {
        business: { select: { name: true } },
      },
    });
  }

  async findUserBookings(customerId: string) {
    return this.prisma.booking.findMany({
      where: { customerId },
      include: { business: { select: { name: true } } },
      orderBy: { startsAt: 'asc' },
    });
  }
}
