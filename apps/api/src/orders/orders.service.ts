import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '@campusflow/contracts';
import { OrderStatus } from '@prisma/client';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface OrderEvent {
  type: 'order_created' | 'order_updated';
  order: any;
}

function formatOrder<T extends { subtotalMinor: bigint; feeMinor: bigint; totalMinor: bigint; items?: Array<any> }>(order: T) {
  return {
    ...order,
    subtotalMinor: Number(order.subtotalMinor),
    feeMinor: Number(order.feeMinor),
    totalMinor: Number(order.totalMinor),
    ...(order.items
      ? {
          items: order.items.map((i) => ({
            ...i,
            unitPriceMinor: Number(i.unitPriceMinor),
          })),
        }
      : {}),
  };
}

@Injectable()
export class OrdersService {
  private orderEvents$ = new Subject<OrderEvent>();

  constructor(private readonly prisma: PrismaService) {}

  getOrderStream(businessId?: string, customerId?: string): Observable<any> {
    return this.orderEvents$.asObservable().pipe(
      filter((e) => {
        if (businessId && e.order.businessId !== businessId) return false;
        if (customerId && e.order.customerId !== customerId) return false;
        return true;
      }),
      map((e) => ({
        data: e,
      })),
    );
  }

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

    const formattedOrder = formatOrder(order);

    // Emit live event for connected merchants and customers
    this.orderEvents$.next({
      type: 'order_created',
      order: formattedOrder,
    });

    return formattedOrder;
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

    return orders.map(formatOrder);
  }

  async findBusinessOrders(businessId: string) {
    const orders = await this.prisma.order.findMany({
      where: { businessId },
      include: {
        items: true,
        customer: { select: { displayName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(formatOrder);
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status as OrderStatus },
      include: { items: true },
    });

    const formattedOrder = formatOrder(order);

    this.orderEvents$.next({
      type: 'order_updated',
      order: formattedOrder,
    });

    return formattedOrder;
  }
}
