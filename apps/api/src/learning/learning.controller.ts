import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LearningService } from './learning.service';
import { CreateLearningResourceDto } from './dto/learning.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Academic Hub & Learning Resources')
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get('resources')
  @ApiOperation({ summary: 'List and filter academic course materials and past exams' })
  getResources(
    @Query('campusId') campusId?: string,
    @Query('department') department?: string,
    @Query('courseCode') courseCode?: string,
    @Query('resourceType') resourceType?: string,
  ) {
    return this.learningService.getResources(campusId, department, courseCode, resourceType);
  }

  @Get('resources/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List materials uploaded by me' })
  getMyResources(@Request() req: any) {
    return this.learningService.getMyResources(req.user.id);
  }

  @Get('resources/:id')
  @ApiOperation({ summary: 'Get details of an academic material' })
  getResourceById(@Param('id') id: string) {
    return this.learningService.getResourceById(id);
  }

  @Post('resources')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload / share a study note, exam paper, or lab manual' })
  createResource(@Request() req: any, @Body() dto: CreateLearningResourceDto) {
    return this.learningService.createResource(req.user.id, dto);
  }

  @Post('resources/:id/download')
  @ApiOperation({ summary: 'Record download counter and return resource download file URL' })
  recordDownload(@Param('id') id: string) {
    return this.learningService.recordDownload(id);
  }
}
