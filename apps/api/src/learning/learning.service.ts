import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLearningResourceDto } from './dto/learning.dto';

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  async getResources(campusId?: string, department?: string, courseCode?: string, resourceType?: string) {
    return this.prisma.learningResource.findMany({
      where: {
        isApproved: true,
        ...(campusId ? { campusId } : {}),
        ...(department ? { department: { contains: department, mode: 'insensitive' } } : {}),
        ...(courseCode ? { courseCode: { contains: courseCode, mode: 'insensitive' } } : {}),
        ...(resourceType ? { resourceType: resourceType as any } : {}),
      },
      include: {
        uploader: {
          select: { displayName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getResourceById(id: string) {
    const resource = await this.prisma.learningResource.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { displayName: true },
        },
      },
    });

    if (!resource) throw new NotFoundException('Learning resource not found');

    return resource;
  }

  async createResource(uploaderId: string, dto: CreateLearningResourceDto) {
    return this.prisma.learningResource.create({
      data: {
        campusId: dto.campusId,
        uploaderId,
        title: dto.title,
        description: dto.description,
        department: dto.department,
        courseCode: dto.courseCode,
        resourceType: dto.resourceType || 'lecture_note',
        fileUrl: dto.fileUrl,
        isApproved: true,
      },
      include: {
        uploader: {
          select: { displayName: true },
        },
      },
    });
  }

  async recordDownload(id: string) {
    const resource = await this.prisma.learningResource.findUnique({
      where: { id },
    });

    if (!resource) throw new NotFoundException('Learning resource not found');

    const updated = await this.prisma.learningResource.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
      },
    });

    return {
      message: 'Download recorded successfully',
      fileUrl: updated.fileUrl,
      downloadCount: updated.downloadCount,
    };
  }

  async getMyResources(uploaderId: string) {
    return this.prisma.learningResource.findMany({
      where: { uploaderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
