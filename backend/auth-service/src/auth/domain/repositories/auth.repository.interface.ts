import { Auth, Auth as AuthEntity } from '../entities/auth.entity';

export interface IAuthRepository {
    findByEmail(email: string): Promise<AuthEntity | null>;
    findById(id: string): Promise<AuthEntity | null>;
    create(email: string, passwordHash: string| null, roleId: string): Promise<AuthEntity>;
    updatePassword(id: string, passwordHash: string): Promise<void>;
    updateRole(id: string, roleId: string): Promise<void>;
    updateAuth(id: string, authData: Partial<Auth>): Promise<void>;
    delete(id: string): Promise<void>;
    save(auth: AuthEntity);
    
    // Role-based queries
    findByRoleId(roleId: string): Promise<AuthEntity[]>;
    countByRoleId(roleId: string): Promise<number>;
    count(): Promise<number>;

    // sercurity method
    updateLastLogin(id: string): Promise<void>;
    lockAccount(id: string, reason?: string): Promise<void>;
    unlockAccount(id: string): Promise<void>;
    incrementFailedLoginAttempts(id: string): Promise<number>;

    // query method
    findInactiveUsers(days: number): Promise<AuthEntity[]>;
    findLockedUsers(): Promise<AuthEntity[]>;

    search(
        keyword: string,
        roleId?: string,
        page?: number,
        limit?: number
    ): Promise<{ users: AuthEntity[]; total: number }>;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';