import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsObject,
    ValidateNested,
    Min,
    Max,
    MinLength,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AcceptRegistrationDto {
    @IsString()
    @IsOptional()
    @MaxLength(500)
    acceptanceNote?: string;
}

export class RejectRegistrationDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(500)
    rejectionReason: string;
}

export class CancelRegistrationDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(500)
    cancellationReason: string;
}

class LocationDto {
    @IsNumber()
    @Min(-90)
    @Max(90)
    lat: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    lng: number;
}

export class CheckInDto {
    @IsString()
    @IsOptional()
    notes?: string;
}

export class CheckOutDto {
    @IsString()
    @IsOptional()
    notes?: string;
}

export class RateEventDto {
    @IsNumber()
    @Min(1)
    @Max(5)
    stars: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(1000)
    review: string;
}

export class RateVolunteerDto {
    @IsNumber()
    @Min(1)
    @Max(5)
    performance: number;

    @IsNumber()
    @Min(1)
    @Max(5)
    punctuality: number;

    @IsNumber()
    @Min(1)
    @Max(5)
    teamwork: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(500)
    comment: string;
}