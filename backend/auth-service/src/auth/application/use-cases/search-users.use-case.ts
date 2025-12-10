import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Auth } from '../../domain/entities/auth.entity';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';

@Injectable()
export class SearchUsersUseCase  {
    constructor(
        @Inject(AUTH_REPOSITORY) 
        private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) { }

    async execute(
        keyword: string = '',
        roleName?: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ users: Auth[]; total: number }> {
        let roleId: string | undefined;

        if (roleName) {
            const role = await this.roleRepository.findByName(roleName);
            roleId = role?.id;
        }

        return this.authRepository.search(keyword, roleId, page, limit);
    }
}