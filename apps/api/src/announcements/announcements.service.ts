import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(campusId?: string) {
    const list = await this.prisma.announcement.findMany({
      where: campusId ? { campusId } : {},
      include: {
        author: {
          select: { displayName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return list.map((a) => ({
      id: a.id,
      campusId: a.campusId,
      title: a.title,
      summary: a.body.length > 140 ? `${a.body.slice(0, 137)}...` : a.body,
      content: a.body,
      category: 'academic',
      publisher: a.author?.displayName || 'HU Administration',
      publishedAt: a.publishedAt || a.createdAt,
      isImportant: true,
      createdAt: a.createdAt,
    }));
  }
}
