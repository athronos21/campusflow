import { Controller, Post, Get, Body, Param, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto, PaymentWebhookDto } from './dto/payments.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Payments & Transactions')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize a payment (Telebirr, CBE Birr, Cash)' })
  initializePayment(@Request() req: any, @Body() dto: InitializePaymentDto) {
    return this.paymentsService.initializePayment(req.user.id, dto);
  }

  @Post('verify/:reference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify or simulate payment completion (Telebirr/CBE)' })
  verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Payment gateway webhook callback (Telebirr / Chapa)' })
  handleWebhook(@Body() dto: PaymentWebhookDto) {
    return this.paymentsService.handleWebhook(dto);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payments for an order' })
  getPaymentByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentByOrder(orderId);
  }

  @Get('reservation/:reservationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payments for a transport ticket' })
  getPaymentByReservation(@Param('reservationId') reservationId: string) {
    return this.paymentsService.getPaymentByReservation(reservationId);
  }
}
