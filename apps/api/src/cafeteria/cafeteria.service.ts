import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyMealPassDto, RecordMealScanDto } from '@campusflow/contracts';

@Injectable()
export class CafeteriaService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyPass(userId: string) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        campus: true,
      },
    });

    if (!studentProfile) {
      throw new NotFoundException('No student profile found for current user');
    }

    const activePass = await this.prisma.mealPass.findFirst({
      where: {
        studentProfileId: studentProfile.id,
        isActive: true,
        validUntil: { gte: new Date() },
      },
      include: {
        mealPlan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activePass) {
      throw new NotFoundException('No active cafeteria meal pass found');
    }

    // Check today's scans
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayScans = await this.prisma.mealScanLog.findMany({
      where: {
        mealPassId: activePass.id,
        scannedDate: today,
      },
    });

    return {
      passId: activePass.id,
      passCode: activePass.passCode,
      dietaryPreference: activePass.dietaryPreference,
      studentName: studentProfile.user.displayName,
      studentIdNumber: studentProfile.studentIdNumber,
      department: studentProfile.department,
      campusName: studentProfile.campus.name,
      mealPlanName: activePass.mealPlan.name,
      validUntil: activePass.validUntil.toISOString(),
      todayScans: todayScans.map((s) => ({
        mealPeriod: s.mealPeriod,
        diningHall: s.diningHall,
        scannedAt: s.scannedAt.toISOString(),
      })),
      menuSchedule: [
        { period: 'breakfast', label: 'Breakfast (ቁርስ)', time: '7:00 AM - 8:30 AM', menu: 'Special Kinche, Fresh Bread & Tea' },
        { period: 'lunch', label: 'Lunch (ምሳ)', time: '12:00 PM - 2:00 PM', menu: 'Shiro Wot with Injera & Salad' },
        { period: 'dinner', label: 'Dinner (እራት)', time: '6:00 PM - 8:00 PM', menu: 'Misir Wot, Rice & Tea' },
      ],
    };
  }

  async verifyPass(dto: VerifyMealPassDto) {
    const pass = await this.prisma.mealPass.findUnique({
      where: { passCode: dto.passCode },
      include: {
        studentProfile: {
          include: { user: true },
        },
        mealPlan: true,
      },
    });

    if (!pass || !pass.isActive || pass.validUntil < new Date()) {
      return {
        valid: false,
        reason: 'Meal pass is invalid, expired, or deactivated',
      };
    }

    // Check if already redeemed for this period today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingScan = await this.prisma.mealScanLog.findUnique({
      where: {
        uq_meal_pass_daily_period: {
          mealPassId: pass.id,
          scannedDate: today,
          mealPeriod: dto.mealPeriod,
        },
      },
    });

    if (existingScan) {
      return {
        valid: false,
        alreadyRedeemed: true,
        reason: `Pass already redeemed for ${dto.mealPeriod} today at ${existingScan.scannedAt.toLocaleTimeString()}`,
        studentName: pass.studentProfile.user.displayName,
        studentIdNumber: pass.studentProfile.studentIdNumber,
        dietaryPreference: pass.dietaryPreference,
      };
    }

    return {
      valid: true,
      alreadyRedeemed: false,
      passId: pass.id,
      studentName: pass.studentProfile.user.displayName,
      studentIdNumber: pass.studentProfile.studentIdNumber,
      dietaryPreference: pass.dietaryPreference,
      mealPeriod: dto.mealPeriod,
      mealPlanName: pass.mealPlan.name,
    };
  }

  async recordScan(staffUserId: string, dto: RecordMealScanDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const scanLog = await this.prisma.mealScanLog.create({
        data: {
          mealPassId: dto.mealPassId,
          scannedById: staffUserId,
          mealPeriod: dto.mealPeriod,
          diningHall: dto.diningHall,
          scannedDate: today,
        },
        include: {
          mealPass: {
            include: {
              studentProfile: {
                include: { user: true },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: 'Meal redemption confirmed',
        studentName: scanLog.mealPass.studentProfile.user.displayName,
        dietaryPreference: scanLog.mealPass.dietaryPreference,
        mealPeriod: scanLog.mealPeriod,
        scannedAt: scanLog.scannedAt.toISOString(),
      };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(`Meal pass already scanned for ${dto.mealPeriod} today.`);
      }
      throw error;
    }
  }
}
