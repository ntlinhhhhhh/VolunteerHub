import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    IsUrl,
    MinLength,
    MaxLength,
    ArrayMaxSize,
} from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1, { message: 'Content must be at least 1 character long' })
    @MaxLength(5000)
    content: string;

    @IsArray()
    @IsUrl({}, { each: true })
    @IsOptional()
    @ArrayMaxSize(10)
    images?: string[];

    @IsArray()
    @IsUrl({}, { each: true })
    @IsOptional()
    @ArrayMaxSize(3)
    videos?: string[];
}