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
import { AnnouncementsModule } from './announcements/announcements.module';
import { TransportModule } from './transport/transport.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadModule } from './upload/upload.module';
import { HousingModule } from './housing/housing.module';
import { EventsModule } from './events/events.module';
import { LearningModule } from './learning/learning.module';
import { WalletModule } from './wallet/wallet.module';
import { CafeteriaModule } from './cafeteria/cafeteria.module';
import { StudentModule } from './student/student.module';
import { AssistantModule } from './assistant/assistant.module';

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
    AnnouncementsModule,
    TransportModule,
    PaymentsModule,
    UploadModule,
    HousingModule,
    EventsModule,
    LearningModule,
    WalletModule,
    CafeteriaModule,
    StudentModule,
    AssistantModule,
  ],
})
export class AppModule {}
