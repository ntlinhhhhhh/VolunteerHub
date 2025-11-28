import { IsEmail, IsString, MinLength, IsMongoId } from 'class-validator';

export class CreateAdminDto {
    @IsEmail({}, {message: "Email invalid"})
    email: string;

    @IsString()
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    pasword: string;

    @IsMongoId({ message: "Invalid roleId"})
    roleId: string;
}