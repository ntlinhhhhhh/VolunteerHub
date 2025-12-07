import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsArray,
    IsEnum,
    IsDate,
    IsObject,
    ValidateNested,
    Min,
    Max,
    MinLength,
    MaxLength,
    IsUrl,
    ArrayMinSize,
    ArrayMaxSize,
    IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class CoordinatesDto {
    @IsNumber()
    @Min(-90)
    @Max(90)
    lat: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    lng: number;
}

class LocationDto {
    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    district: string;

    @IsString()
    @IsOptional()
    ward?: string;

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => CoordinatesDto)
    coordinates?: CoordinatesDto;
}


class ScheduleDto {
    @IsDate()
    @Type(() => Date)
    startDate: Date;

    @IsDate()
    @Type(() => Date)
    endDate: Date;

    @IsDate()
    @Type(() => Date)
    registrationDeadline: Date;
}

class RequirementsDto {
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(100)
    minAge?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(100)
    maxAge?: number;

    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(20)
    skills: string[];

    @IsString()
    @IsOptional()
    @MaxLength(500)
    experience?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    healthRequirements?: string;
}

class CapacityDto {
    @IsNumber()
    @Min(1)
    @Max(10000)
    maxVolunteers: number;

    @IsNumber()
    @Min(1)
    @Max(10000)
    minVolunteers: number;
}

class RoleDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(500)
    description: string;

    @IsNumber()
    @Min(1)
    @Max(1000)
    slots: number;
}

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(200)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(50)
    @MaxLength(5000)
    description: string;

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsObject()
    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @IsObject()
    @ValidateNested()
    @Type(() => ScheduleDto)
    schedule: ScheduleDto;

    @IsObject()
    @ValidateNested()
    @Type(() => RequirementsDto)
    requirements: RequirementsDto;

    @IsObject()
    @ValidateNested()
    @Type(() => CapacityDto)
    capacity: CapacityDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RoleDto)
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    roles: RoleDto[];

    @IsArray()
    @IsUrl({}, { each: true })
    @IsOptional()
    @ArrayMaxSize(10)
    images?: string[];

    @IsArray()
    @IsUrl({}, { each: true })
    @IsOptional()
    @ArrayMaxSize(5)
    videos?: string[];

    @IsEnum(['public', 'private'])
    @IsOptional()
    visibility?: 'public' | 'private';

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @ArrayMaxSize(20)
    tags?: string[];
}