import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, ProductQueryDto } from '@campusflow/contracts';

function serializeProduct(product: any) {
  if (!product) return product;
  return {
    ...product,
    priceMinor: Number(product.priceMinor),
  };
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findProducts(query: ProductQueryDto) {
    const products = await this.prisma.product.findMany({
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

    return products.map(serializeProduct);
  }

  async createProduct(businessId: string, dto: CreateProductDto) {
    const product = await this.prisma.product.create({
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

    return serializeProduct(product);
  }

  async toggleAvailability(id: string, isAvailable: boolean) {
    const product = await this.prisma.product.update({
      where: { id },
      data: { isAvailable },
    });

    return serializeProduct(product);
  }
}
