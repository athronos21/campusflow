import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitializePaymentDto, PaymentWebhookDto } from './dto/payments.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initializePayment(userId: string, dto: InitializePaymentDto) {
    if (!dto.orderId && !dto.reservationId) {
      throw new BadRequestException('Either orderId or reservationId must be provided');
    }

    let amountMinor: bigint;
    let currency = 'ETB';
    let targetType: 'order' | 'reservation';

    if (dto.orderId) {
      targetType = 'order';
      const order = await this.prisma.order.findUnique({
        where: { id: dto.orderId },
      });
      if (!order) throw new NotFoundException('Order not found');
      if (order.customerId !== userId) throw new BadRequestException('Not authorized for this order');
      if (order.paymentStatus === 'paid') throw new BadRequestException('Order is already paid');
      amountMinor = order.totalMinor;
      currency = order.currency;
    } else {
      targetType = 'reservation';
      const reservation = await this.prisma.ticketReservation.findUnique({
        where: { id: dto.reservationId },
      });
      if (!reservation) throw new NotFoundException('Reservation not found');
      if (reservation.passengerId !== userId) throw new BadRequestException('Not authorized for this reservation');
      if (reservation.paymentStatus === 'paid') throw new BadRequestException('Reservation is already paid');
      amountMinor = reservation.amountMinor;
      currency = reservation.currency;
    }

    const providerRef = `${dto.provider.toUpperCase().slice(0, 3)}-HU-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        reservationId: dto.reservationId,
        provider: dto.provider,
        providerReference: providerRef,
        amountMinor,
        currency,
        status: 'pending',
      },
    });

    const amountInBirr = (Number(amountMinor) / 100).toFixed(2);

    let instructions = '';
    let ussdDial = '';
    let qrData = '';

    if (dto.provider === 'telebirr') {
      ussdDial = `*127*1*251911223344*${amountInBirr}#`;
      qrData = `telebirr://pay?to=CAMPUSFLOW_HU&amount=${amountInBirr}&ref=${providerRef}`;
      instructions = `Dial ${ussdDial} on your Ethio Telecom phone or scan with Telebirr App. Use Reference: ${providerRef}`;
    } else if (dto.provider === 'cbe_birr') {
      ussdDial = `*847#`;
      qrData = `cbebirr://pay?shortcode=882194&amount=${amountInBirr}&ref=${providerRef}`;
      instructions = `Dial *847# or open CBE Birr App. Choose Pay Merchant / Bill (Short code: 882194) and enter Ref: ${providerRef}`;
    } else {
      instructions = 'Pay in cash directly at pickup counter or campus departure terminal upon ticket verification.';
    }

    return {
      paymentId: payment.id,
      provider: payment.provider,
      providerReference: providerRef,
      amountMinor: amountMinor.toString(),
      amountInBirr,
      currency,
      status: payment.status,
      ussdDial,
      qrData,
      instructions,
    };
  }

  async verifyPayment(reference: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerReference: reference },
      include: {
        order: true,
        reservation: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment reference ${reference} not found`);
    }

    if (payment.status === 'paid') {
      return {
        success: true,
        message: 'Payment already verified',
        payment: { ...payment, amountMinor: payment.amountMinor.toString() },
      };
    }

    // In sandbox / pilot demo mode, confirm the payment
    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'paid' },
      });

      if (payment.orderId) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'paid' },
        });

        // Notify customer
        if (payment.order?.customerId) {
          await tx.notification.create({
            data: {
              userId: payment.order.customerId,
              type: 'payment_success',
              title: 'Payment Successful',
              body: `Your payment of ${(Number(payment.amountMinor) / 100).toFixed(2)} ETB via ${payment.provider.toUpperCase()} has been verified!`,
            },
          });
        }
      }

      if (payment.reservationId) {
        await tx.ticketReservation.update({
          where: { id: payment.reservationId },
          data: {
            paymentStatus: 'paid',
            status: 'confirmed',
          },
        });

        if (payment.reservation?.passengerId) {
          await tx.notification.create({
            data: {
              userId: payment.reservation.passengerId,
              type: 'ticket_confirmed',
              title: 'Transport Ticket Confirmed',
              body: `Your bus seat has been confirmed! QR Code: ${payment.reservation.qrCode}`,
            },
          });
        }
      }

      return updatedPayment;
    });

    return {
      success: true,
      message: 'Payment verified and transaction updated successfully',
      payment: {
        ...updated,
        amountMinor: updated.amountMinor.toString(),
      },
    };
  }

  async handleWebhook(dto: PaymentWebhookDto) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        provider: dto.provider,
        providerReference: dto.providerReference,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment transaction not found for webhook');
    }

    if (dto.status === 'succeeded') {
      return this.verifyPayment(dto.providerReference);
    } else {
      const paymentStatus = dto.status === 'failed' ? 'failed' : 'refunded';
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: paymentStatus },
      });

      if (payment.orderId) {
        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus },
        });
      }

      return { success: true, status: paymentStatus };
    }
  }

  async getPaymentByOrder(orderId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
    return payments.map((p) => ({
      ...p,
      amountMinor: p.amountMinor.toString(),
    }));
  }

  async getPaymentByReservation(reservationId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { reservationId },
      orderBy: { createdAt: 'desc' },
    });
    return payments.map((p) => ({
      ...p,
      amountMinor: p.amountMinor.toString(),
    }));
  }
}
