import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CampusesService } from './campuses.service';

@ApiTags('Campuses')
@Controller('campuses')
export class CampusesController {
  constructor(private readonly campusesService: CampusesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active campuses in Ethiopia' })
  @ApiResponse({ status: 200, description: 'List of active campuses.' })
  async getCampuses() {
    return this.campusesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get specific campus details by slug' })
  async getCampus(@Param('slug') slug: string) {
    return this.campusesService.findBySlug(slug);
  }
}
