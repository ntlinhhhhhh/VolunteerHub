import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';

import * as cacheManager from '@nestjs/cache-manager';
import { Token } from "src/auth/domain/entities/token.entity";
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { ROLE_REPOSITORY } from "../../domain/repositories/role.repository.interface";
import type { IRoleRepository } from "../../domain/repositories/role.repository.interface";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AdminLoginUseCase {
    constructor(
        @Inject('USER_SERVICE') private userClient: ClientProxy,
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER)
        private readonly cache: cacheManager.Cache,
        private readonly configService: ConfigService,
    ) { console.log('✅ AdminLoginUseCase constructor called'); }

    async execute(email: string, password: string) {
        const admin = await this.authRepository.findByEmail(email);

        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const role = await this.roleRepository.findById(admin.roleId);
        if (!role || role.name !== 'admin') {
            throw new UnauthorizedException('Access denied');
        }

        const isPasswordValid = await bcrypt.compare(password, admin?.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const admin_profile = await firstValueFrom(
            this.userClient.send('user.findByEmail', {
                email: email,
            }));


        const accessToken = this.jwtService.sign(
            {
                userId: admin.id,
                email: admin.email,
                name: admin_profile.fullName,
                phoneNumber: admin_profile.phoneNumber,
                roleId: admin.roleId,
                roleName: role.name,
                permissions: admin.role?.permissions || [],
            },
            {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }
        );

        const refreshToken = this.jwtService.sign(
            { email: admin.email, type: 'refresh' },
            {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
                subject: admin.id.toString(),
            }
        );

        await this.cache.set(`refresh:${admin.id}`, refreshToken, 7 * 24 * 60 * 60);
        return new Token(accessToken, refreshToken, 900);
    }
}