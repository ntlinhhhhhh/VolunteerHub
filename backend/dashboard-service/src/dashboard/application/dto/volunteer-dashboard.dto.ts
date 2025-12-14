import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MetricPeriod } from '../../domain/entities/shared/metrics.entity';
import * as volunteerDashboardEntity from '../../domain/entities/volunteer-dashboard.entity';

// ✅ FIX: Thêm validation decorators
export class GetVolunteerDashboardDto {
    @ApiProperty({ 
        description: 'User ID',
        example: '507f1f77bcf86cd799439011'
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ 
        description: 'Metric period',
        enum: MetricPeriod,
        default: MetricPeriod.THIS_MONTH
    })
    @IsEnum(MetricPeriod)
    @IsNotEmpty()
    period: MetricPeriod;
}

// ✅ FIX: Thêm metadata đầy đủ
export class VolunteerDashboardResponseDto {
    @ApiProperty({ description: 'Request success status' })
    success: boolean;

    @ApiProperty({ description: 'Dashboard data' })
    data: volunteerDashboardEntity.VolunteerDashboard;

    @ApiProperty({ description: 'Whether data is from cache' })
    cached: boolean;

    @ApiProperty({ 
        description: 'Cache TTL remaining in seconds',
        required: false 
    })
    cacheExpiresIn?: number;

    @ApiProperty({ description: 'Response timestamp' })
    timestamp: Date;

    constructor(data: volunteerDashboardEntity.VolunteerDashboard, cached: boolean = false, ttl?: number) {
        this.success = true;
        this.data = data;
        this.cached = cached;
        this.cacheExpiresIn = ttl;
        this.timestamp = new Date();
    }
}