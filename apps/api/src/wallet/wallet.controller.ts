import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { InitiateWalletTransferDto, TopupWalletDto } from '@campusflow/contracts';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user wallet balance and recent ledger history' })
  async getMyWallet(@CurrentUser() user: AuthenticatedUser) {
    return this.walletService.getMyWallet(user.id);
  }

  @Post('transfer')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atomic double-entry peer-to-peer wallet transfer' })
  async transfer(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitiateWalletTransferDto,
  ) {
    return this.walletService.transfer(user.id, dto);
  }

  @Post('topup')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Deposit funds into wallet via Telebirr, CBE Birr, or Chapa' })
  async topup(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: TopupWalletDto,
  ) {
    return this.walletService.topup(user.id, dto);
  }
}
