import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from '@campusflow/contracts';
import { CampusRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { signAccessToken } from '../common/auth-token';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email already registered');
    }

    if (dto.phone) {
      const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (existing) throw new ConflictException('Phone number already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.$transaction(async (tx) => {
      const existingUsersCount = await tx.user.count();
      const assignedRole =
        existingUsersCount === 0 ? CampusRole.campus_admin : CampusRole.student;

      return tx.user.create({
        data: {
          email: dto.email,
          phone: dto.phone,
          displayName: dto.displayName,
          passwordHash,
          memberships: {
            create: {
              campusId: dto.campusId,
              role: assignedRole,
            },
          },
        },
        include: {
          memberships: true,
        },
      });
    });

    const roles = user.memberships.map((m) => m.role);
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      roles,
    });

    return {
      accessToken,
      refreshToken: accessToken,
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        memberships: user.memberships.map((m) => ({
          campusId: m.campusId,
          role: m.role,
        })),
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { phone: dto.identifier }],
      },
      include: {
        memberships: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = user.memberships.map((m) => m.role);
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      roles,
    });

    return {
      accessToken,
      refreshToken: accessToken,
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        memberships: user.memberships.map((m) => ({
          campusId: m.campusId,
          role: m.role,
        })),
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { memberships: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles: user.memberships.map((m) => m.role),
      memberships: user.memberships.map((m) => ({
        campusId: m.campusId,
        role: m.role,
      })),
    };
  }
}
