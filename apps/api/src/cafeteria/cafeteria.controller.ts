import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CafeteriaService } from './cafeteria.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { VerifyMealPassDto, RecordMealScanDto } from '@campusflow/contracts';

@ApiTags('Cafeteria Dining')
@Controller('cafeteria')
export class CafeteriaController {
  constructor(private readonly cafeteriaService: CafeteriaService) {}

  @Get('pass')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current student dining meal pass and daily schedule' })
  async getMyPass(@CurrentUser() user: AuthenticatedUser) {
    return this.cafeteriaService.getMyPass(user.id);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify meal pass QR code at dining hall intake terminal' })
  async verifyPass(@Body() dto: VerifyMealPassDto) {
    return this.cafeteriaService.verifyPass(dto);
  }

  @Post('scan')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Staff records official meal redemption scan' })
  async recordScan(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RecordMealScanDto,
  ) {
    return this.cafeteriaService.recordScan(user.id, dto);
  }
}
