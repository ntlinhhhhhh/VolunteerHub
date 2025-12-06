import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Auth } from '../../domain/entities/auth.entity';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';

@Injectable()
export class GetUsersByRoleUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) 
        private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) { }

    async execute(roleName: string): Promise<Auth[]> {
        const validRoles = ['volunteer', 'event_manager', 'admin'];
        if (!validRoles.includes(roleName)) {
            throw new BadRequestException(
                `Invalid role. Must be one of: ${validRoles.join(', ')}`
            );
        }

        // Find role by name
        const role = await this.roleRepository.findByName(roleName);
        if (!role) {
            return [];
        }

        // Find users by roleId
        return this.authRepository.findByRoleId(role.id);
    }
}