import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('[PRISMA] Database connected successfully.');
    } catch (err: any) {
      console.warn('[PRISMA] ⚠️ Could not connect to PostgreSQL on port 5433 at boot (is Docker running?). Prisma will retry on query execution.');
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {}
  }
}
