import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Moderation & Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('businesses/pending')
  @Roles('campus_admin', 'campus_moderator')
  @ApiOperation({ summary: 'List pending business registrations requiring admin verification' })
  async getPendingBusinesses(@Query('campusId') campusId: string) {
    return this.moderationService.getPendingBusinesses(campusId);
  }

  @Patch('businesses/:id/verify')
  @Roles('campus_admin', 'campus_moderator')
  @ApiOperation({ summary: 'Approve & verify a campus business' })
  async verifyBusiness(@Param('id') id: string) {
    return this.moderationService.verifyBusiness(id);
  }

  @Post('reports')
  @ApiOperation({ summary: 'Report a merchant, product, or transaction' })
  async fileReport(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { entityType: string; entityId: string; reason: string; details?: string },
  ) {
    return this.moderationService.fileComplaint(
      user.id,
      body.entityType,
      body.entityId,
      body.reason,
      body.details,
    );
  }
}
