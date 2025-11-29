import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';
import type { Cache } from 'cache-manager';
import { IAuthRepository } from "auth/domain/repositories/auth.repository.interface";
import { IRoleRepository } from "auth/domain/repositories/role.repository.interface";
import { AuthRepository } from "auth/infrastructure/repositories/auth.repository";

@Injectable()
export class AdminLoginUseCase{
    constructor(
        @Inject(AuthRepository)
        private readonly authRepository: IAuthRepository,

        @Inject(IRoleRepository)
        private readonly roleRepository: IRoleRepository,

        private readonly jwtService: JwtService,

        @Inject(CACHE_MANAGER) 
        private readonly cacheManager: Cache,
    ) {}

    async execute(email: string, password: string) {
        const admin = await this.authRepository.findByEmail(email);

        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const role = await this.roleRepository.findById(admin.roleId);
        if (!role || role.name !== 'admin') {
            throw new UnauthorizedException('Access denied');
        }

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { 
            userId: admin.id, 
            email: admin.email, 
            roleId: role.id, 
            roleName: role.name, 
            permissions: role.permissions, 
        };

        const accessToken = this.jwtService.sign(payload, {expiresIn: '15m'});
        const refreshToken = this.jwtService.sign(
            { sub: admin.id, type: 'refresh' },
            { expiresIn: '7d' }
        );

        await this.cacheManager.set(`refresh:${admin.id}`, refreshToken);

        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
            userId: admin.id,
        };
    }
}