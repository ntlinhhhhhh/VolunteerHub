import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MetricPeriod } from '../../domain/entities/shared/metrics.entity';
import { UserRole } from '../../domain/entities/volunteer-dashboard.entity';

export class ExportDashboardDto {
    @ApiProperty({ description: 'User ID' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'User role',
        enum: UserRole
    })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;

    @ApiProperty({
        description: 'Export format',
        enum: ['PDF', 'EXCEL', 'CSV']
    })
    @IsEnum(['PDF', 'EXCEL', 'CSV'])
    @IsNotEmpty()
    format: 'PDF' | 'EXCEL' | 'CSV';

    @ApiProperty({
        description: 'Metric period',
        enum: MetricPeriod
    })
    @IsEnum(MetricPeriod)
    @IsNotEmpty()
    period: MetricPeriod;
}

export class ExportDashboardResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ description: 'Download URL for the exported file' })
    downloadUrl: string;

    @ApiProperty({ description: 'URL expiration timestamp' })
    expiresAt: Date;

    @ApiProperty({ description: 'File size in bytes', required: false })
    fileSize?: number;

    @ApiProperty({ description: 'Export format' })
    format: string;

    constructor(downloadUrl: string, format: string, expiresAt: Date, fileSize?: number) {
        this.success = true;
        this.downloadUrl = downloadUrl;
        this.format = format;
        this.expiresAt = expiresAt;
        this.fileSize = fileSize;
    }
}