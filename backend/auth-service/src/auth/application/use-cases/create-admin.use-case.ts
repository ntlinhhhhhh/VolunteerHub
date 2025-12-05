import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from 'bcryptjs';
import { Auth } from "src/auth/domain/entities/auth.entity";
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { ROLE_REPOSITORY } from "../../domain/repositories/role.repository.interface";
import type { IRoleRepository } from "../../domain/repositories/role.repository.interface";

@Injectable()
export class CreateAdminUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    ) { console.log('✅ CreateAdminUseCase constructor called'); }

    async execute(email: string, password: string, roleId: string): Promise<Auth> {
        if (!Auth.isValidEmail(email)) {
            throw new ConflictException('Email invalid');
        }

        const sanitizedEmail = Auth.sanitizeEmail(email);

        const existingUser = await this.authRepository.findByEmail(sanitizedEmail);
        if (existingUser) {
            throw new ConflictException('Email is exist');
        }

        const role = await this.roleRepository.findById(roleId);
        if (!role) {
            throw new NotFoundException('Role not exist');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        return await this.authRepository.create(sanitizedEmail, passwordHash, roleId);
    }
}