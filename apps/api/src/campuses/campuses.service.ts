import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampusesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.campus.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        isActive: true,
      },
    });
  }

  async findBySlug(slug: string) {
    const campus = await this.prisma.campus.findUnique({
      where: { slug },
    });
    if (!campus) {
      throw new NotFoundException(`Campus with slug '${slug}' not found`);
    }
    return campus;
  }
}
