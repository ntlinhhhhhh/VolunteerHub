import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterGoogleDto {
    @IsEmail({}, { message: 'Invalid email address' })
    email: string;

    @IsString()
    username: string;

    @IsString()
    fullName: string;
}
