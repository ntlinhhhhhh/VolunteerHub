import {
    IsOptional,
    IsString,
    IsNumber,
    IsEnum,
    IsBoolean,
    Min,
    Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FilterPostDto {
    @IsOptional()
    @IsString()
    eventId?: string;

    @IsOptional()
    @IsString()
    authorId?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    isPinned?: boolean;

    @IsOptional()
    @IsString()
    search?: string;

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
    @IsEnum(['createdAt', 'likes', 'comments'])
    sortBy?: 'createdAt' | 'likes' | 'comments' = 'createdAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}