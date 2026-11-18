import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    // Dev placeholder: in production decode JWT using @nestjs/jwt & verify
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Bearer token missing');
    }

    // Attach mock/decoded user for development pipeline
    request.user = {
      id: 'mock-user-uuid',
      email: 'student@haramaya.edu.et',
      displayName: 'Tigist Haile',
      roles: ['student'],
    };

    return true;
  }
}
