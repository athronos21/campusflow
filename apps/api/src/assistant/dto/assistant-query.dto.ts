import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AssistantQueryDto {
  @ApiProperty({ description: 'Student query or question', example: 'When does the next shuttle bus leave?' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({ description: 'Optional campus ID filter' })
  @IsString()
  @IsOptional()
  campusId?: string;
}
