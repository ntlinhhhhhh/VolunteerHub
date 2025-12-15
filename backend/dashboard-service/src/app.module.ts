// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { DashboardController } from './dashboard/presentation/controllers/dashboard.controller';

// Use cases
import { GetVolunteerDashboardUseCase } from './dashboard/application/use-cases/get-volunteer-dashboard.usecase';
import { GetEventManagerDashboardUseCase } from './dashboard/application/use-cases/get-event-manager-dashboard.usecase';
import { GetAdminDashboardUseCase } from './dashboard/application/use-cases/get-admin-dashboard.usecase';
import { ExportDashboardUseCase } from './dashboard/application/use-cases/export-dashboard.usecase';

// Domain services
import { TrendAnalysisService } from './dashboard/domain/services/trend-analysis.service';
import { BadgeEvaluatorService } from './dashboard/domain/services/badge-evaluator.service';
import { ScoreCalculatorService } from './dashboard/domain/services/score-calculator.service';

// Infrastructure
import { HttpClientsModule } from './dashboard/infrastructure/http/http-clients.module';
import { RedisCacheService } from './dashboard/infrastructure/cache/redis-cache.service';
import { ExportService } from './dashboard/infrastructure/repositories/export.service';
import { DashboardRepository } from './dashboard/infrastructure/repositories/dashboard.repository';

// ✅ REAL SCHEMA
import {
    DashboardSnapshot,
    DashboardSnapshotSchema,
} from './dashboard/infrastructure/database/schemas/dashboard-snapshot.schema';
import { AdminDashboard, AdminDashboardSchema, ManagerDashboard, ManagerDashboardSchema, VolunteerDashboard, VolunteerDashboardSchema } from './dashboard/infrastructure/database/schemas';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardAggregationService } from './dashboard/infrastructure/aggregation/dashboard-aggregation.service';

@Module({
    imports: [
        // ENV
        ConfigModule.forRoot({ isGlobal: true }),

        // MongoDB
        MongooseModule.forRoot(
            process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard-service',
        ),

        MongooseModule.forFeature([
            {
                name: VolunteerDashboard.name,
                schema: VolunteerDashboardSchema,
            },
            {
                name: ManagerDashboard.name,
                schema: ManagerDashboardSchema,
            },
            {
                name: AdminDashboard.name,
                schema: AdminDashboardSchema,
            },
            {
                name: DashboardSnapshot.name,
                schema: DashboardSnapshotSchema,
            },
        ]),

        ScheduleModule.forRoot(),

        // HTTP clients
        HttpClientsModule,
    ],

    controllers: [DashboardController],

    providers: [
        // Use cases
        GetVolunteerDashboardUseCase,
        GetEventManagerDashboardUseCase,
        GetAdminDashboardUseCase,
        ExportDashboardUseCase,

        // Domain services
        ScoreCalculatorService,
        TrendAnalysisService,
        BadgeEvaluatorService,

        // Repository
        DashboardRepository,

        // Interfaces
        {
            provide: 'IDashboardRepository',
            useExisting: DashboardRepository,
        },
        {
            provide: 'ICacheService',
            useClass: RedisCacheService,
        },
        {
            provide: 'IExportService',
            useClass: ExportService,
        },

        DashboardAggregationService,
    ],
})
export class AppModule { }
