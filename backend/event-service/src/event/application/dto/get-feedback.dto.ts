import { IsOptional, IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { FeedbackType } from '../../domain/entities/feedback.entity';

export class GetFeedbackDto {
    @IsString()
    @IsOptional()
    eventId?: string;

    @IsString()
    @IsOptional()
    volunteerId?: string;

    @IsString()
    @IsOptional()
    managerId?: string;

    @IsEnum(FeedbackType)
    @IsOptional()
    feedbackType?: FeedbackType;

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 20;

    @IsEnum(['createdAt', 'rating'])
    @IsOptional()
    sortBy?: 'createdAt' | 'rating' = 'createdAt';

    @IsEnum(['asc', 'desc'])
    @IsOptional()
    sortOrder?: 'asc' | 'desc' = 'desc';
}