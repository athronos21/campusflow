import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from '@campusflow/contracts';
import * as bcrypt from 'bcrypt';

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

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        displayName: dto.displayName,
        passwordHash,
        memberships: {
          create: {
            campusId: dto.campusId,
            role: 'student',
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    return {
      accessToken: 'sample-jwt-access-token',
      refreshToken: 'sample-jwt-refresh-token',
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

    return {
      accessToken: 'sample-jwt-access-token',
      refreshToken: 'sample-jwt-refresh-token',
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
}
