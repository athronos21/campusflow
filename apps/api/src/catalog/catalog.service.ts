import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, ProductQueryDto } from '@campusflow/contracts';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findProducts(query: ProductQueryDto) {
    return this.prisma.product.findMany({
      where: {
        ...(query.businessId ? { businessId: query.businessId } : {}),
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
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
        category: true,
        business: {
          select: { id: true, name: true, campusId: true },
        },
      },
      take: query.limit || 50,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(businessId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        businessId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        priceMinor: BigInt(dto.priceMinor),
        currency: dto.currency || 'ETB',
        stockQuantity: dto.stockQuantity,
        isAvailable: dto.isAvailable ?? true,
      },
    });
  }

  async toggleAvailability(id: string, isAvailable: boolean) {
    return this.prisma.product.update({
      where: { id },
      data: { isAvailable },
    });
  }
}
