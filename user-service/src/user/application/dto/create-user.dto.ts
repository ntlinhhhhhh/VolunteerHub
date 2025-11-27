import { IsEmail, IsString, MinLength, IsMongoId } from 'class-validator';

export class CreateUserDto {
  @IsMongoId({ message: 'Auth ID không hợp lệ' })
  authId: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  fullName: string;
}