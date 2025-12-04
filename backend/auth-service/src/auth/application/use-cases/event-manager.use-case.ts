import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';
import { IAuthRepository } from "src/auth/domain/repositories/auth.repository.interface";
import { IRoleRepository } from "src/auth/domain/repositories/role.repository.interface";
import { AuthRepository } from "src/auth/infrastructure/repositories/auth.repository";
import * as cacheManager from '@nestjs/cache-manager';
import { Token } from "src/auth/domain/entities/token.entity";

@Injectable()
export class EventManagerLoginUseCase {
    constructor(
        @Inject(AuthRepository)
        private readonly authRepository: IAuthRepository,
        @Inject(IRoleRepository)
        private readonly roleRepository: IRoleRepository,
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER)
        private readonly cache: cacheManager.Cache,
        private readonly configService: ConfigService,
    ) {}

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

        const accessToken = this.jwtService.sign(
            {
                userId: eventManger.id,
                email: eventManger.email,
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