import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { Auth } from '../../domain/entities/auth.entity';
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { ROLE_REPOSITORY } from "../../domain/repositories/role.repository.interface";
import type { IRoleRepository } from "../../domain/repositories/role.repository.interface";

@Injectable()
export class UpdateUserRoleUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) 
        private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) { }

    async execute(authId: string, roleName: string): Promise<Auth> {
        const validRoles = ['volunteer', 'event_manager', 'admin'];
        if (!validRoles.includes(roleName)) {
            throw new BadRequestException(
                `Invalid role. Must be one of: ${validRoles.join(', ')}`
            );
        }

        const auth = await this.authRepository.findById(authId);
        if (!auth) {
            throw new NotFoundException('User not found');
        }

        const role = await this.roleRepository.findByName(roleName);
        if (!role) {
            throw new NotFoundException(`Role '${roleName}' not found`);
        }

        await this.authRepository.updateRole(auth.id, role.id);

        const updatedAuth = await this.authRepository.findById(authId);
        if (!updatedAuth) {
            throw new NotFoundException('User not found after update');
        }

        return updatedAuth;
    }
}