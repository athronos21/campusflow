import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        campus: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Student profile not found for current user');
    }

    return {
      id: profile.id,
      userId: profile.userId,
      studentIdNumber: profile.studentIdNumber,
      displayName: profile.user.displayName,
      email: profile.user.email,
      phone: profile.user.phone,
      college: profile.college,
      department: profile.department,
      academicLevel: profile.academicLevel,
      batchYear: profile.batchYear,
      emergencyPhone: profile.emergencyPhone,
      idCardStatus: profile.idCardStatus,
      campusName: profile.campus.name,
      campusCity: profile.campus.city,
      issuedAt: profile.issuedAt.toISOString(),
      expiresAt: profile.expiresAt.toISOString(),
      qrVerificationUrl: `https://campusflow.haramaya.edu.et/verify/id/${profile.studentIdNumber}`,
    };
  }

  async verifyStudentId(studentIdNumber: string) {
    const profile = await this.prisma.studentProfile.findFirst({
      where: { studentIdNumber },
      include: {
        user: true,
        campus: true,
      },
    });

    if (!profile) {
      return {
        isValid: false,
        reason: 'Student ID not found in university directory',
      };
    }

    const isExpired = profile.expiresAt < new Date();
    const isActive = profile.idCardStatus === 'active' && !isExpired;

    return {
      isValid: isActive,
      status: profile.idCardStatus,
      isExpired,
      studentIdNumber: profile.studentIdNumber,
      displayName: profile.user.displayName,
      college: profile.college,
      department: profile.department,
      academicLevel: profile.academicLevel,
      batchYear: profile.batchYear,
      campusName: profile.campus.name,
      expiresAt: profile.expiresAt.toISOString(),
    };
  }
}
