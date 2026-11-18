import { IsString, IsOptional, IsUUID, IsIn, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitializePaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reservationId?: string;

  @ApiProperty({
    example: 'telebirr',
    enum: ['telebirr', 'cbe_birr', 'chapa', 'cash_on_pickup', 'cash_at_station'],
  })
  @IsIn(['telebirr', 'cbe_birr', 'chapa', 'cash_on_pickup', 'cash_at_station'])
  provider: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  returnUrl?: string;
}

export class PaymentWebhookDto {
  @ApiProperty({ example: 'telebirr' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'TB-HARAMAYA-REF-12345' })
  @IsString()
  providerReference: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reservationId?: string;

  @ApiProperty({ example: 'succeeded', enum: ['succeeded', 'failed', 'refunded'] })
  @IsIn(['succeeded', 'failed', 'refunded'])
  status: 'succeeded' | 'failed' | 'refunded';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signature?: string;
}
