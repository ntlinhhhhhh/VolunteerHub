import {
    IsString,
    IsNotEmpty,
    IsArray,
    IsObject,
    ValidateNested,
    MinLength,
    MaxLength,
    IsPhoneNumber,
    IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class EmergencyContactDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    relationship: string;
}

export class CreateRegistrationDto {
    @IsString()
    @IsNotEmpty()
    eventId: string;

    @IsString()
    @IsNotEmpty()
    roleId: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(50)
    @MaxLength(1000)
    motivation: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    experience?: string;

    @IsArray()
    @IsString({ each: true })
    skills: string[];

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    availability: string;

    @IsObject()
    @ValidateNested()
    @Type(() => EmergencyContactDto)
    emergencyContact: EmergencyContactDto;
}