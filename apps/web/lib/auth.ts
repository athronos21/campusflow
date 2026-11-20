import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: 'user',
    fields: {
      name: 'displayName',
    },
    additionalFields: {
      phone: {
        type: 'string',
        required: false,
      },
      status: {
        type: 'string',
        required: false,
        defaultValue: 'active',
      },
    },
  },
  session: {
    modelName: 'session',
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  account: {
    modelName: 'account',
  },
  verification: {
    modelName: 'verification',
  },
});
