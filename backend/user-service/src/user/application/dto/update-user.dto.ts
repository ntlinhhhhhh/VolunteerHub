import { IsString, IsOptional, IsDateString, MinLength, IsIn } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @MinLength(2)
    username?: string;

    @IsString()
    @IsOptional()
    @MinLength(2)
    fullName?: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsDateString()
    @IsOptional()
    dateOfBirth?: Date;
}