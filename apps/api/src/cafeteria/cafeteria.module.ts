import { Module } from '@nestjs/common';
import { CafeteriaController } from './cafeteria.controller';
import { CafeteriaService } from './cafeteria.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CafeteriaController],
  providers: [CafeteriaService],
  exports: [CafeteriaService],
})
export class CafeteriaModule {}
