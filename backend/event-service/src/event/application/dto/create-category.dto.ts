import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsNumber,
    MinLength,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateCategoryDto {
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

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    icon: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    color: string;

    @IsString()
    @IsOptional()
    parentId?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    order?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;
}

export class UpdateCategoryDto {
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(100)
    name?: string;

    @IsString()
    @IsOptional()
    @MinLength(10)
    @MaxLength(500)
    description?: string;

    @IsString()
    @IsOptional()
    @MaxLength(10)
    icon?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    color?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    order?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}