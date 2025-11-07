import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import bcrypt from "node_modules/bcryptjs/umd/types";
import { Auth } from "src/domain/entities/auth.entity";
import { IAuthRepository } from "src/domain/repositories/auth.repository.interface";
import { IRoleRepository } from "src/domain/repositories/role.repository.interface";

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
            throw new ConflictException('Email đã được sử dụng');
        }

        const role = await this.roleRepository.findById(roleId);
        if (!role) {
            throw new NotFoundException('Role not exist');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        return await this.authRepository.create(sanitizedEmail, passwordHash, roleId);
    }
}