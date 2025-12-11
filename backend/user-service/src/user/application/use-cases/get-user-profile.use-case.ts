import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User, UserStatus } from '../../domain/entities/user.entity';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserWithRoleDto } from '../dto/user-with-role.dto';

@Injectable()
export class GetUserProfileUseCase {
    constructor(
        @Inject(IUserRepository)
        private readonly userRepository: IUserRepository,
        @Inject('AUTH_SERVICE') private authClient: ClientProxy,

    ) { }

    async execute(userId: string): Promise<User> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async executeByAuthId(authId: string): Promise<User> {
        const user = await this.userRepository.findByAuthId(authId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async executeByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async executeByUsername(username: string) {
        const user = await this.userRepository.findByUsername(username);
        return user || null;
    }
    
    async executeAll(
        filters?: {
            status?: UserStatus;
            role?: string;
            page?: number;
            limit?: number;
        }
    ): Promise<{ users: UserWithRoleDto[]; total: number }> {
        const result = await this.userRepository.findAll(filters);
        let { users, total } = result;

        if (!users || users.length === 0) {
            throw new NotFoundException('User not found');
        }

        try {
            // Gọi auth-service để lấy role
            const response = await firstValueFrom(
                this.authClient.send('auth.getUsersByRole', { role: filters?.role || '' })
            );

            const roleUsersData = response.data || [];
            // Map userId => role name
            const roleMap = new Map<string, string>();
            roleUsersData.forEach(u => {
                roleMap.set(u.id, u.role?.name || null);
            });

            // Map users sang DTO, gán role
            let usersWithRoles: UserWithRoleDto[] = users.map(user => ({
                id: user.id,
                authId: user.authId,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                avatar: user.avatar,
                address: user.address,
                bio: user.bio,
                dateOfBirth: user.dateOfBirth,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                role: roleMap.get(user.authId.toString()) || null,
            }));

            if (filters?.role) {
                usersWithRoles = usersWithRoles.filter(u => u.role === filters.role);
            }

            total = usersWithRoles.length;
            return { users: usersWithRoles, total };

        } catch (err) {
            console.error('Failed to fetch users from auth-service', err);
            const usersWithRoles: UserWithRoleDto[] = users.map(user => ({
                id: user.id,
                authId: user.authId,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                avatar: user.avatar,
                address: user.address,
                bio: user.bio,
                dateOfBirth: user.dateOfBirth,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                role: null,
            }));
            return { users: usersWithRoles, total: usersWithRoles.length };
        }
    }
}