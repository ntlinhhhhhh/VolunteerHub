import {
    IsOptional,
    IsString,
    IsNumber,
    IsEnum,
    IsBoolean,
    IsDateString,
    IsArray,
    Min,
    Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EventStatus } from '../../domain/entities/event-status.enum';

export class FilterEventDto {
    @IsOptional()
    @IsEnum(EventStatus)
    status?: EventStatus;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    organizerId?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    district?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    featured?: boolean;

    @IsOptional()
    @IsEnum(['public', 'private'])
    visibility?: 'public' | 'private';

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsDateString()
    startDateFrom?: string;

    @IsOptional()
    @IsDateString()
    startDateTo?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
    tags?: string[];

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @IsEnum(['createdAt', 'startDate', 'title', 'currentVolunteers'])
    sortBy?: 'createdAt' | 'startDate' | 'title' | 'currentVolunteers' = 'createdAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}