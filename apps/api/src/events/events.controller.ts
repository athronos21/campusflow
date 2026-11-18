import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateCampusEventDto } from './dto/events.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Campus Events & RSVPs')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List upcoming campus events and hackathons' })
  getEvents(@Query('campusId') campusId?: string, @Query('category') category?: string) {
    return this.eventsService.getEvents(campusId, category);
  }

  @Get('rsvps/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my confirmed event RSVPs and tickets' })
  getMyRsvps(@Request() req: any) {
    return this.eventsService.getMyRsvps(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details for a specific campus event' })
  getEventById(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new campus event or workshop' })
  createEvent(@Request() req: any, @Body() dto: CreateCampusEventDto) {
    return this.eventsService.createEvent(req.user.id, dto);
  }

  @Post(':id/rsvp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'RSVP / Register for a campus event to receive an entry pass' })
  rsvpEvent(@Request() req: any, @Param('id') id: string) {
    return this.eventsService.rsvpEvent(req.user.id, id);
  }
}
