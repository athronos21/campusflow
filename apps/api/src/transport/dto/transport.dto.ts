import { IsString, IsOptional, IsUUID, IsNumber, Min, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchTripsQueryDto {
  @ApiPropertyOptional({ example: 'Haramaya Main Campus' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ example: 'Dire Dawa' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  campusId?: string;

  @ApiPropertyOptional({ example: '2026-11-19' })
  @IsOptional()
  @IsString()
  date?: string;
}

export class CreateTicketReservationDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  tripId: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  seatNumber: number;

  @ApiProperty({ example: 'Tigist Haile' })
  @IsString()
  passengerName: string;

  @ApiProperty({ example: '+251922334455' })
  @IsString()
  passengerPhone: string;

  @ApiPropertyOptional({ example: 'telebirr', enum: ['telebirr', 'cbe_birr', 'cash_at_station'] })
  @IsOptional()
  @IsIn(['telebirr', 'cbe_birr', 'cash_at_station'])
  paymentProvider?: string;
}
