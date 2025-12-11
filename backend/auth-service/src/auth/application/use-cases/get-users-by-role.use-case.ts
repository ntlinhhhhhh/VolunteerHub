import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Auth, Auth as AuthEntity } from '../../domain/entities/auth.entity';
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

    async execute(roleName?: string): Promise<AuthEntity[]> {
        const validRoles = ['volunteer', 'event_manager', 'admin'];
        let auths;

        if (roleName && !validRoles.includes(roleName)) {
            throw new BadRequestException(
                `Invalid role. Must be one of: ${validRoles.join(', ')}`
            );
        }

        if (!roleName) {
            auths = this.authRepository.findAll();
            return auths
        }

        const role = await this.roleRepository.findByName(roleName);
        if (!role) {
            return [];
        }

        return this.authRepository.findByRoleId(role.id);
    }

}