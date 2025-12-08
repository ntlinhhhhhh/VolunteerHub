import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { ROLE_REPOSITORY } from "../../domain/repositories/role.repository.interface";
import type { IRoleRepository } from "../../domain/repositories/role.repository.interface";

import * as cacheManager from '@nestjs/cache-manager';
import { Token } from "src/auth/domain/entities/token.entity";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class EventManagerLoginUseCase {
    constructor(
        @Inject('USER_SERVICE') private userClient: ClientProxy,
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER)
        private readonly cache: cacheManager.Cache,
        private readonly configService: ConfigService,
    ) { console.log('✅ EventManagerLoginUseCase constructor called'); }

    async execute(email: string, password: string) {
        const eventManger = await this.authRepository.findByEmail(email);

        if (!eventManger) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const role = await this.roleRepository.findById(eventManger.roleId);
        if (!role || role.name !== 'event_manager') {
            throw new UnauthorizedException('Access denied');
        }

        const isPasswordValid = await bcrypt.compare(password, eventManger?.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const event_manager_profile = await firstValueFrom(
            this.userClient.send('user.findByEmail', {
                email: email,
            }));

        const accessToken = this.jwtService.sign(
            {
                userId: eventManger.id,
                email: eventManger.email,
                name: event_manager_profile.fullName,
                phoneNumber: event_manager_profile.phoneNumber,
                roleId: eventManger.roleId,
                roleName: role.name,
                permissions: eventManger.role?.permissions || [],
            },
            {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }
        );

        const refreshToken = this.jwtService.sign(
            { email: eventManger.email, type: 'refresh' },
            {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
                subject: eventManger.id.toString(),
            }
        );

        await this.cache.set(`refresh:${eventManger.id}`, refreshToken, 7 * 24 * 60 * 60);
        return new Token(accessToken, refreshToken, 900);
    }
}