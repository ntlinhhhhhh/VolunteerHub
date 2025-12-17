import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    Min,
    Max,
    MaxLength,
    IsEnum,
} from 'class-validator';
import { FeedbackType } from '../../domain/entities/feedback.entity';

export class CreateFeedbackDto {
    @IsString()
    @IsNotEmpty()
    eventId: string;

    @IsString()
    @IsNotEmpty()
    volunteerId: string;

    @IsEnum(FeedbackType)
    feedbackType: FeedbackType;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @IsOptional()
    @MaxLength(1000)
    comment?: string;
}