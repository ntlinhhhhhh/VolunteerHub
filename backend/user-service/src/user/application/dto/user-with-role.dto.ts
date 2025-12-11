import { UserStatus } from "src/user/domain/entities/user.entity";

export class UserWithRoleDto {
    id: string;
    authId: string;
    email: string;
    username: string;
    fullName: string;
    phoneNumber: string | null;
    avatar: string | null;
    address: string | null;
    bio: string | null;
    dateOfBirth: Date | null;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    role: string | null;
}