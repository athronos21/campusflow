import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransportService } from './transport.service';
import { SearchTripsQueryDto, CreateTicketReservationDto } from './dto/transport.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Transport & Ticketing')
@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('routes')
  @ApiOperation({ summary: 'List available transport routes' })
  getRoutes(@Query('campusId') campusId?: string) {
    return this.transportService.getRoutes(campusId);
  }

  @Get('trips')
  @ApiOperation({ summary: 'Search scheduled transport trips' })
  searchTrips(@Query() query: SearchTripsQueryDto) {
    return this.transportService.searchTrips(query);
  }

  @Get('trips/:id')
  @ApiOperation({ summary: 'Get trip details and seat availability' })
  getTripById(@Param('id') id: string) {
    return this.transportService.getTripById(id);
  }

  @Post('reservations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reserve a seat on a trip' })
  createReservation(@Request() req: any, @Body() dto: CreateTicketReservationDto) {
    return this.transportService.createReservation(req.user.id, dto);
  }

  @Get('reservations/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List user ticket reservations' })
  getUserReservations(@Request() req: any) {
    return this.transportService.getUserReservations(req.user.id);
  }

  @Post('reservations/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a ticket reservation' })
  cancelReservation(@Request() req: any, @Param('id') id: string) {
    return this.transportService.cancelReservation(req.user.id, id);
  }
}
