import { Controller, Get, Post, Patch, Body, Param, UseGuards, Sse, Query, MessageEvent } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '@campusflow/contracts';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Observable } from 'rxjs';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Sse('stream')
  @ApiOperation({ summary: 'Server-Sent Events (SSE) live order stream' })
  orderStream(
    @Query('businessId') businessId?: string,
    @Query('customerId') customerId?: string,
  ): Observable<MessageEvent> {
    return this.ordersService.getOrderStream(businessId, customerId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Place a food or product order (server computes snapshot totals)' })
  async createOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(user.id, dto);
  }

  @Get('my-orders')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List customer orders with live status' })
  async getMyOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.findUserOrders(user.id);
  }

  @Get('business/:businessId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List incoming orders for a merchant business' })
  async getBusinessOrders(@Param('businessId') businessId: string) {
    return this.ordersService.findBusinessOrders(businessId);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update order lifecycle status (Merchant or Staff)' })
  async updateStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(orderId, dto);
  }
}
