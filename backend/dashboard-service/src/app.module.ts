import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard/presentation/controllers/dashboard.controller';
import { GetTrendingEventsUseCase } from './dashboard/application/use-cases/get-trending-events.use-case';
import { GetRecentActivitiesUseCase } from './dashboard/application/use-cases/get-recent-activities.use-case';
import { GetUserStatsUseCase } from './dashboard/application/use-cases/get-user-stats.use-case';
import { UpdateDashboardDataUseCase } from './dashboard/application/use-cases/update-dashboard-data.use-case';
import { DashboardRepository } from './dashboard/infrastructure/repositories/dashboard.repository';
import { IDashboardRepository } from './dashboard/domain/repositories/dashboard.repository.interface';
import { RabbitMQService } from './dashboard/infrastructure/message-bus/rabbitmq.service';
import { DashboardConsumerService } from './dashboard/infrastructure/message-bus/dashboard-consumer.service';
import { DatabaseService } from './dashboard/infrastructure/config/database.service';
import {
  TrendingEvent,
  TrendingEventSchema,
} from './dashboard/infrastructure/database/schemas/trending-event.schema';
import {
  RecentActivity,
  RecentActivitySchema,
} from './dashboard/infrastructure/database/schemas/recent-activity.schema';
import {
  UserStats,
  UserStatsSchema,
} from './dashboard/infrastructure/database/schemas/user-stats.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://volunteer-mongo:27017/dashboard-service'
    ),
    MongooseModule.forFeature([
      { name: TrendingEvent.name, schema: TrendingEventSchema },
      { name: RecentActivity.name, schema: RecentActivitySchema },
      { name: UserStats.name, schema: UserStatsSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [
    GetTrendingEventsUseCase,
    GetRecentActivitiesUseCase,
    GetUserStatsUseCase,
    UpdateDashboardDataUseCase,
    DashboardRepository,
    RabbitMQService,
    DashboardConsumerService,
    DatabaseService,
    { provide: IDashboardRepository, useClass: DashboardRepository },
  ],
})
export class AppModule {}