import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto, BusinessQueryDto } from '@campusflow/contracts';
import { BusinessStatus } from '@prisma/client';

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeBusinessProducts<
    T extends { products?: Array<{ priceMinor: bigint | number | string }> },
  >(business: T) {
    return {
      ...business,
      products: (business.products ?? []).map((product) => ({
        ...product,
        priceMinor: Number(product.priceMinor),
      })),
    };
  }

  async findAll(query: BusinessQueryDto) {
    const businesses = await this.prisma.business.findMany({
      where: {
        campusId: query.campusId,
        status: (query.status as BusinessStatus) || BusinessStatus.verified,
        ...(query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        products: {
          where: { isAvailable: true },
          take: 5,
        },
      },
      take: query.limit || 20,
    });

    return businesses.map((business) => this.serializeBusinessProducts(business));
  }

  async findOne(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return this.serializeBusinessProducts(business);
  }

  async register(ownerId: string, dto: CreateBusinessDto) {
    return this.prisma.business.create({
      data: {
        campusId: dto.campusId,
        ownerId,
        name: dto.name,
        description: dto.description,
        status: BusinessStatus.pending,
      },
    });
  }
}
