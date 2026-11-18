import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsIn } from 'class-validator';

export class CreateLearningResourceDto {
  @ApiProperty({ example: 'a1b2c3d4-0000-0000-0000-000000000001' })
  @IsUUID()
  @IsNotEmpty()
  campusId: string;

  @ApiProperty({ example: 'Data Structures & Algorithms - Lecture Notes (CS 201)' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Comprehensive lecture slides covering binary search trees, hashing, and Dijkstra algorithm.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: 'CoSc201' })
  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @ApiPropertyOptional({
    example: 'lecture_note',
    enum: ['lecture_note', 'past_exam', 'syllabus', 'lab_manual'],
    default: 'lecture_note',
  })
  @IsIn(['lecture_note', 'past_exam', 'syllabus', 'lab_manual'])
  @IsOptional()
  resourceType?: 'lecture_note' | 'past_exam' | 'syllabus' | 'lab_manual';

  @ApiProperty({ example: 'https://storage.googleapis.com/campusflow-static/notes/dsa_lec_notes.pdf' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;
}
