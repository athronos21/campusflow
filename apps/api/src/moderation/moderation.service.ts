import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessStatus, ReportStatus } from '@prisma/client';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingBusinesses(campusId: string) {
    return this.prisma.business.findMany({
      where: {
        campusId,
        status: BusinessStatus.pending,
      },
      include: {
        owner: { select: { displayName: true, email: true, phone: true } },
      },
    });
  }

  async verifyBusiness(businessId: string) {
    return this.prisma.business.update({
      where: { id: businessId },
      data: { status: BusinessStatus.verified },
    });
  }

  async fileComplaint(reporterId: string, entityType: string, entityId: string, reason: string, details?: string) {
    return this.prisma.report.create({
      data: {
        reporterId,
        entityType,
        entityId,
        reason,
        details,
      },
    });
  }

  async getReports() {
    return this.prisma.report.findMany({
      include: {
        reporter: { select: { displayName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async resolveReport(id: string) {
    return this.prisma.report.update({
      where: { id },
      data: { status: ReportStatus.resolved },
    });
  }
}
