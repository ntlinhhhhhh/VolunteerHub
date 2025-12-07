import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Token } from '../../domain/entities/token.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
import { ConfigService } from '@nestjs/config';
// import type { Cache } from 'cache-manager';
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { ROLE_REPOSITORY } from "../../domain/repositories/role.repository.interface";
import type { IRoleRepository } from "../../domain/repositories/role.repository.interface";
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LoginUseCase {
    private readonly MAX_FAILED_ATTEMPTS = 5;

    constructor(
        @Inject('USER_SERVICE') private userClient: ClientProxy,
        @Inject(CACHE_MANAGER) private readonly cache: cacheManager.Cache,
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {
        console.log('✅ LoginUseCase constructor called');
    }

    async execute(email: string, password: string): Promise<Token> {
        const auth = await this.authRepository.findByEmail(email);
        if (!auth) {
            throw new UnauthorizedException('No account found with this email');
        }

        if (auth.isAccountLocked()) {
            throw new UnauthorizedException('This account is currently locked');
        }

        const role = await this.roleRepository.findById(auth.roleId);
        if (!role || role.name !== 'volunteer') {
            throw new UnauthorizedException('Access denied');
        }
        const isPasswordValid = await bcrypt.compare(password, auth?.passwordHash);
        if (!isPasswordValid) {
            const attempts = await this.authRepository.incrementFailedLoginAttempts(auth.id);

            if (attempts >= this.MAX_FAILED_ATTEMPTS) {
                await this.authRepository.lockAccount(
                    auth.id,
                    `Account locked after ${attempts} failed login attempts`
                );
                throw new UnauthorizedException(
                    `Account has been locked after ${attempts} unsuccessful login attempts`
                );
            }

            throw new UnauthorizedException(
                `Invalid email or password. You have ${this.MAX_FAILED_ATTEMPTS - attempts} attempts left.`
            );
        }

        await this.authRepository.updateLastLogin(auth.id);
        
       const volunteer_profile = await firstValueFrom(
            this.userClient.send('user.findByEmail', {
                email: email,
            }));
        const accessToken = this.jwtService.sign(
            {
                userId: auth.id,
                email: auth.email,
                name: volunteer_profile.fullName,
                phoneNumber: volunteer_profile.phoneNumber,
                roleId: auth.roleId,
                roleName: role.name,
                permissions: auth.role?.permissions || [],
            },
            {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }
        );

        const refreshToken = this.jwtService.sign(
            { email: auth.email, type: 'refresh' },
            {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
                subject: auth.id.toString(),
            }
        );

        await this.cache.set(`refresh:${auth.id}`, refreshToken, 7 * 24 * 60 * 60);
        return new Token(accessToken, refreshToken, 900);
    }
}
