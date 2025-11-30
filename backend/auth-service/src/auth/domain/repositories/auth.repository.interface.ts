import { Auth as AuthEntity } from '../entities/auth.entity';
import { UserRole } from '../entities/user-role.entity';

export interface IAuthRepository {
    findByEmail(email: string): Promise<AuthEntity | null>;
    findById(id: string): Promise<AuthEntity | null>;
    create(email: string, passwordHash: string| null, roleId: string): Promise<AuthEntity>;
    updatePassword(id: string, passwordHash: string): Promise<void>;
    updateRole(id: string, roleId: string): Promise<void>;
    delete(id: string): Promise<void>;

    // sercurity method
    updateLastLogin(id: string): Promise<void>;
    lockAccount(id: string, reason?: string): Promise<void>;
    unlockAccount(id: string): Promise<void>;
    incrementFailedLoginAttempts(id: string): Promise<number>;

    // query method
    findInactiveUsers(days: number): Promise<AuthEntity[]>;
    findLockedUsers(): Promise<AuthEntity[]>;

}

export const IAuthRepository = Symbol('IAuthRepository');