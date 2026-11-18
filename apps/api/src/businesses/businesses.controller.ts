import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto, BusinessQueryDto } from '@campusflow/contracts';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Businesses & Directory')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get()
  @ApiOperation({ summary: 'List or search verified campus businesses' })
  async getBusinesses(@Query() query: BusinessQueryDto) {
    return this.businessesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business details and product catalog' })
  async getBusiness(@Param('id') id: string) {
    return this.businessesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register a new campus business (pending verification)' })
  async registerBusiness(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.businessesService.register(user.id, dto);
  }
}
