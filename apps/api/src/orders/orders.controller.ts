import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '@campusflow/contracts';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place a food or product order (server computes snapshot totals)' })
  async createOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(user.id, dto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'List customer orders with live status' })
  async getMyOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.findUserOrders(user.id);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'List incoming orders for a merchant business' })
  async getBusinessOrders(@Param('businessId') businessId: string) {
    return this.ordersService.findBusinessOrders(businessId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order lifecycle status (Merchant or Staff)' })
  async updateStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(orderId, dto);
  }
}
