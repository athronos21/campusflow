import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CampusesModule } from './campuses/campuses.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BusinessesModule } from './businesses/businesses.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { BookingsModule } from './bookings/bookings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ModerationModule } from './moderation/moderation.module';

@Module({
  imports: [
    PrismaModule,
    CampusesModule,
    AuthModule,
    UsersModule,
    BusinessesModule,
    CatalogModule,
    OrdersModule,
    BookingsModule,
    NotificationsModule,
    ModerationModule,
  ],
})
export class AppModule {}
