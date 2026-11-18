import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampusEventDto } from './dto/events.dto';
import * as crypto from 'crypto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async getEvents(campusId?: string, category?: string) {
    const events = await this.prisma.campusEvent.findMany({
      where: {
        ...(campusId ? { campusId } : {}),
        ...(category ? { category } : {}),
      },
      include: {
        organizer: {
          select: { displayName: true, email: true },
        },
        _count: {
          select: { rsvps: true },
        },
      },
      orderBy: { startsAt: 'asc' },
    });

    return events.map((e) => ({
      ...e,
      entryFeeMinor: e.entryFeeMinor.toString(),
    }));
  }

  async getEventById(id: string) {
    const event = await this.prisma.campusEvent.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { displayName: true, email: true },
        },
        _count: {
          select: { rsvps: true },
        },
      },
    });

    if (!event) throw new NotFoundException('Event not found');

    return {
      ...event,
      entryFeeMinor: event.entryFeeMinor.toString(),
    };
  }

  async createEvent(organizerId: string, dto: CreateCampusEventDto) {
    const event = await this.prisma.campusEvent.create({
      data: {
        campusId: dto.campusId,
        organizerId,
        title: dto.title,
        description: dto.description,
        venue: dto.venue,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        category: dto.category || 'Campus Life',
        entryFeeMinor: BigInt(dto.entryFeeMinor || 0),
        currency: 'ETB',
        maxAttendees: dto.maxAttendees,
        bannerUrl: dto.bannerUrl,
      },
      include: {
        organizer: {
          select: { displayName: true, email: true },
        },
        _count: {
          select: { rsvps: true },
        },
      },
    });

    return {
      ...event,
      entryFeeMinor: event.entryFeeMinor.toString(),
    };
  }

  async rsvpEvent(userId: string, eventId: string) {
    const event = await this.prisma.campusEvent.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { rsvps: true },
        },
      },
    });

    if (!event) throw new NotFoundException('Event not found');

    // Check capacity
    if (event.maxAttendees && event._count.rsvps >= event.maxAttendees) {
      throw new BadRequestException('Event is fully booked');
    }

    // Check if already registered
    const existing = await this.prisma.eventRsvp.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    const ticketCode = `TKT-EVT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const rsvp = await this.prisma.eventRsvp.create({
      data: {
        eventId,
        userId,
        ticketCode,
        status: 'registered',
      },
      include: {
        event: {
          select: {
            title: true,
            venue: true,
            startsAt: true,
          },
        },
      },
    });

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'event_rsvp_confirmed',
        title: 'Event RSVP Confirmed',
        body: `You are confirmed for "${event.title}". Ticket: ${ticketCode}`,
      },
    });

    return rsvp;
  }

  async getMyRsvps(userId: string) {
    const rsvps = await this.prisma.eventRsvp.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organizer: {
              select: { displayName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rsvps.map((r) => ({
      ...r,
      event: {
        ...r.event,
        entryFeeMinor: r.event.entryFeeMinor.toString(),
      },
    }));
  }
}
