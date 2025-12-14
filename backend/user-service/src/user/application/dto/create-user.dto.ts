import { IsEmail, IsString, MinLength, IsMongoId } from 'class-validator';

export class CreateUserDto {
    @IsMongoId({ message: 'Invalid authId' })
    authId: string;

    @IsEmail({}, { message: 'Invalid email' })
    email: string;

    @IsString()
    @MinLength(2, { message: 'Username must be at least 6 characters long' })
    username: string;

    @IsString()
    @MinLength(2, { message: 'FullName must be at least 6 characters long' })
    fullName: string;

    avatar?: string;
}