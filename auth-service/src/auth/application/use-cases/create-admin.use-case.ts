import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Auth } from "auth/domain/entities/auth.entity";
import { IAuthRepository } from "auth/domain/repositories/auth.repository.interface";
import { IRoleRepository } from "auth/domain/repositories/role.repository.interface";
import bcrypt from 'bcryptjs';

@Injectable()
export class CreateAdminUseCase {
    constructor(
        @Inject(IAuthRepository)
        private readonly authRepository: IAuthRepository,
        @Inject(IRoleRepository)
        private readonly roleRepository: IRoleRepository
    ) {}
    
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