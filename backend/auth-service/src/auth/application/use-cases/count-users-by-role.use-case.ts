import { Injectable, Inject } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';

export interface UserCountByRole {
    total: number;
    admin: number;
    event_manager: number;
    volunteer: number;
}

@Injectable()
export class CountUsersByRoleUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) 
        private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) { }

    async execute(roleName?: string): Promise<UserCountByRole | number> {
        if (roleName) {
            // Count by specific role
            const role = await this.roleRepository.findByName(roleName);
            if (!role) return 0;
            return this.authRepository.countByRoleId(role.id);
        }

        // Count all by each role
        const roles = await this.roleRepository.findAll();
        const roleMap = new Map(roles.map(r => [r.name, r.id]));

        const [total, admin, event_manager, volunteer] = await Promise.all([
            this.authRepository.count(),
            this.authRepository.countByRoleId(roleMap.get('admin') || ''),
            this.authRepository.countByRoleId(roleMap.get('event_manager') || ''),
            this.authRepository.countByRoleId(roleMap.get('volunteer') || ''),
        ]);

        return {
            total,
            admin,
            event_manager,
            volunteer,
        };
    }
}