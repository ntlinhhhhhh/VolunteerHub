import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Email invalid' })
    email: string;

    @IsString()
    password: string;
    }