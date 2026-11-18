import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateCampusEventDto {
  @ApiProperty({ example: 'a1b2c3d4-0000-0000-0000-000000000001' })
  @IsUUID()
  @IsNotEmpty()
  campusId: string;

  @ApiProperty({ example: 'Haramaya Tech & Innovation Hackathon 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Annual 48-hour student hackathon solving agricultural and campus logistics challenges.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Main Auditorium / Hall 4' })
  @IsString()
  @IsNotEmpty()
  venue: string;

  @ApiProperty({ example: '2026-12-10T09:00:00Z' })
  @IsString()
  @IsNotEmpty()
  startsAt: string;

  @ApiPropertyOptional({ example: '2026-12-12T18:00:00Z' })
  @IsString()
  @IsOptional()
  endsAt?: string;

  @ApiPropertyOptional({ example: 'Technology & Hackathons', default: 'Campus Life' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  entryFeeMinor?: number | string;

  @ApiPropertyOptional({ example: 200 })
  @IsNumber()
  @IsOptional()
  maxAttendees?: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d' })
  @IsString()
  @IsOptional()
  bannerUrl?: string;
}
