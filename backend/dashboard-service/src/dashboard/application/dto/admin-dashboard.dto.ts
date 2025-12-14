import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import * as adminDashboardEntity from '../../domain/entities/admin-dashboard.entity';
import { MetricPeriod } from '../../domain/entities/shared/metrics.entity';

export class GetAdminDashboardDto {
    @ApiProperty({ description: 'Admin user ID' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'Metric period',
        enum: MetricPeriod
    })
    @IsEnum(MetricPeriod)
    @IsNotEmpty()
    period: MetricPeriod;
}

export class AdminDashboardResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    data: adminDashboardEntity.AdminDashboard;

    @ApiProperty()
    cached: boolean;

    @ApiProperty({ required: false })
    cacheExpiresIn?: number;

    @ApiProperty()
    timestamp: Date;

    constructor(data: adminDashboardEntity.AdminDashboard, cached: boolean = false, ttl?: number) {
        this.success = true;
        this.data = data;
        this.cached = cached;
        this.cacheExpiresIn = ttl;
        this.timestamp = new Date();
    }
}