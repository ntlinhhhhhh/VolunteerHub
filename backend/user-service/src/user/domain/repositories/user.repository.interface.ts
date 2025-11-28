import { User, UserStatus } from '../entities/user.entity';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;

    findByAuthId(authId: string): Promise<User | null>;

    findByEmail(email: string): Promise<User | null>;

    create(data: {
        authId: string;
        email: string;
        fullName: string;
    }): Promise<User>;

    update(id: string, data: Partial<User>): Promise<User>;

    updateStatus(id: string, status: UserStatus): Promise<void>;

    delete(id: string): Promise<void>;

    findAll(filters?: {
        status?: UserStatus;
        page?: number;
        limit?: number;
    }): Promise<{ users: User[]; total: number }>;

}export const IUserRepository = Symbol('IUserRepository');