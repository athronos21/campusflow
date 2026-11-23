import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from '@campusflow/contracts';
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

  async cancelBooking(customerId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking #${bookingId} not found`);
    }

    if (booking.customerId !== customerId) {
      throw new ForbiddenException('You can only cancel your own appointments');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.cancelled },
      include: { business: { select: { name: true } } },
    });
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking #${bookingId} not found`);
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: { business: { select: { name: true } } },
    });
  }
}
