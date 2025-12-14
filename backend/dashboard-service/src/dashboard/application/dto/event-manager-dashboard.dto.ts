import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import * as eventManagerDashboardEntity from '../../domain/entities/event-manager-dashboard.entity';
import { MetricPeriod } from '../../domain/entities/shared/metrics.entity';

export class GetEventManagerDashboardDto {
    @ApiProperty({ description: 'User ID' })
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

export class EventManagerDashboardResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    data: eventManagerDashboardEntity.EventManagerDashboard;

    @ApiProperty()
    cached: boolean;

    @ApiProperty({ required: false })
    cacheExpiresIn?: number;

    @ApiProperty()
    timestamp: Date;

    constructor(data: eventManagerDashboardEntity.EventManagerDashboard, cached: boolean = false, ttl?: number) {
        this.success = true;
        this.data = data;
        this.cached = cached;
        this.cacheExpiresIn = ttl;
        this.timestamp = new Date();
    }
}
