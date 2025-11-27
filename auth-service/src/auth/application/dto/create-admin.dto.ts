import { IsEmail, IsString, MinLength, IsMongoId } from 'class-validator';

export class CreateAdminDto {
    @IsEmail({}, {message: "Email invalid"})
    email: string;

    @IsString()
    @MinLength(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
    pasword: string;

    @IsMongoId({ message: "Role ID không hợp lệ"})
    roleId: string;
}