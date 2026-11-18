import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HousingService } from './housing.service';
import { CreateHousingListingDto, RequestHousingViewingDto } from './dto/housing.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Housing & Accommodation')
@Controller('housing')
export class HousingController {
  constructor(private readonly housingService: HousingService) {}

  @Get('listings')
  @ApiOperation({ summary: 'Search available student housing and rooms near campus' })
  getListings(@Query('campusId') campusId?: string, @Query('propertyType') propertyType?: string) {
    return this.housingService.getListings(campusId, propertyType);
  }

  @Get('listings/:id')
  @ApiOperation({ summary: 'Get details of a housing listing' })
  getListingById(@Param('id') id: string) {
    return this.housingService.getListingById(id);
  }

  @Post('listings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new housing listing (Landlord / Verified Owner)' })
  createListing(@Request() req: any, @Body() dto: CreateHousingListingDto) {
    return this.housingService.createListing(req.user.id, dto);
  }

  @Post('viewings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request an in-person room viewing' })
  requestViewing(@Request() req: any, @Body() dto: RequestHousingViewingDto) {
    return this.housingService.requestViewing(req.user.id, dto);
  }

  @Get('viewings/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my requested room viewings' })
  getMyViewingRequests(@Request() req: any) {
    return this.housingService.getMyViewingRequests(req.user.id);
  }
}
