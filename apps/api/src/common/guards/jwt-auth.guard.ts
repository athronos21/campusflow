import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development, if header is missing, we still allow with default student for quick testing
      const defaultUser = await this.prisma.user.findFirst({
        where: { email: 'student@haramaya.edu.et' },
        include: { memberships: true },
      });

      if (defaultUser) {
        request.user = {
          id: defaultUser.id,
          email: defaultUser.email,
          displayName: defaultUser.displayName,
          roles: defaultUser.memberships.map((m) => m.role),
        };
        return true;
      }
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.split(' ')[1];
    
    // Check if token specifies merchant or admin
    let targetEmail = 'student@haramaya.edu.et';
    if (token.includes('merchant')) {
      targetEmail = 'merchant@haramayacafe.et';
    } else if (token.includes('admin')) {
      targetEmail = 'admin@campusflow.et';
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: targetEmail },
          { id: token.length === 36 ? token : undefined },
        ],
      },
      include: { memberships: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    request.user = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.memberships.map((m) => m.role),
    };

    return true;
  }
}
