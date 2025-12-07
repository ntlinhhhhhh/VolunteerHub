import {
    IsOptional,
    IsString,
    IsEnum,
    IsNumber,
    IsDateString,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RegistrationStatus } from '../../domain/entities/registration-status.enum';

export class FilterRegistrationDto {
    @IsOptional()
    @IsString()
    eventId?: string;

    @IsOptional()
    @IsString()
    volunteerId?: string;

    @IsOptional()
    @IsString()
    organizerId?: string;

    @IsOptional()
    @IsEnum(RegistrationStatus)
    status?: RegistrationStatus;

    @IsOptional()
    @IsString()
    roleId?: string;

    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @IsOptional()
    @IsDateString()
    dateTo?: string;

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
    @IsEnum(['createdAt', 'eventDate', 'checkInTime'])
    sortBy?: 'createdAt' | 'eventDate' | 'checkInTime' = 'createdAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}