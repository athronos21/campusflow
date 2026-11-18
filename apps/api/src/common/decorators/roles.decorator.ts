import { SetMetadata } from '@nestjs/common';
import { CampusRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (CampusRole | string)[]) => SetMetadata(ROLES_KEY, roles);
