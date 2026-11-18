import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(campusId?: string) {
    return this.prisma.announcement.findMany({
      where: campusId ? { campusId } : {},
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }
}
