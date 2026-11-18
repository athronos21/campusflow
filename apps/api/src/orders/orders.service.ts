import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '@campusflow/contracts';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(customerId: string, dto: CreateOrderDto) {
    // 1. Fetch products to get authoritative server-side prices and snapshot names
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        businessId: dto.businessId,
        isAvailable: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more selected products are unavailable or invalid');
    }

    // 2. Compute totals on the server in minor units (integer)
    let subtotalMinor = BigInt(0);
    const orderItemsData = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemTotal = product.priceMinor * BigInt(item.quantity);
      subtotalMinor += itemTotal;

      return {
        productId: product.id,
        productName: product.name,
        unitPriceMinor: product.priceMinor,
        quantity: item.quantity,
      };
    });

    const feeMinor = BigInt(0); // 0 fee for pilot MVP
    const totalMinor = subtotalMinor + feeMinor;

    // 3. Create order transactionally
    const order = await this.prisma.order.create({
      data: {
        campusId: dto.campusId,
        customerId,
        businessId: dto.businessId,
        status: OrderStatus.pending,
        subtotalMinor,
        feeMinor,
        totalMinor,
        currency: 'ETB',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        business: { select: { id: true, name: true } },
      },
    });

    return {
      ...order,
      subtotalMinor: Number(order.subtotalMinor),
      feeMinor: Number(order.feeMinor),
      totalMinor: Number(order.totalMinor),
      items: order.items.map((i) => ({
        ...i,
        unitPriceMinor: Number(i.unitPriceMinor),
      })),
    };
  }

  async findUserOrders(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
        business: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
      ...o,
      subtotalMinor: Number(o.subtotalMinor),
      feeMinor: Number(o.feeMinor),
      totalMinor: Number(o.totalMinor),
      items: o.items.map((i) => ({
        ...i,
        unitPriceMinor: Number(i.unitPriceMinor),
      })),
    }));
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status as OrderStatus },
      include: { items: true },
    });

    return {
      ...order,
      subtotalMinor: Number(order.subtotalMinor),
      totalMinor: Number(order.totalMinor),
    };
  }
}
