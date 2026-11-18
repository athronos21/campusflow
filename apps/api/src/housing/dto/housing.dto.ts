import { IsString, IsOptional, IsUUID, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHousingListingDto {
  @ApiProperty()
  @IsUUID()
  campusId: string;

  @ApiProperty({ example: 'Furnished Student Room near Gate 2, Bate' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Bate Town, 5 min walk to Main Gate 2' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ enum: ['room', 'apartment', 'shared_house'] })
  @IsOptional()
  @IsIn(['room', 'apartment', 'shared_house'])
  propertyType?: 'room' | 'apartment' | 'shared_house';

  @ApiProperty({ example: '250000', description: 'Rent in minor units (ETB cents)' })
  rentMinor: string | number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  hasWater?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  hasElectricity?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasWifi?: boolean;

  @ApiProperty({ example: '+251911223344' })
  @IsString()
  contactPhone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class RequestHousingViewingDto {
  @ApiProperty()
  @IsUUID()
  listingId: string;

  @ApiProperty({ example: '2026-11-22T10:00:00.000Z' })
  @IsString()
  preferredDate: string;

  @ApiProperty({ example: '+251922334455' })
  @IsString()
  studentPhone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}
