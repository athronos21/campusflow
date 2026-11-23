import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Student & Digital ID')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current student official university identification card' })
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.studentService.getMyProfile(user.id);
  }

  @Get('verify/:studentIdNumber')
  @ApiOperation({ summary: 'Public gate turnstile scanner verification endpoint' })
  async verifyStudentId(@Param('studentIdNumber') studentIdNumber: string) {
    return this.studentService.verifyStudentId(studentIdNumber);
  }
}
