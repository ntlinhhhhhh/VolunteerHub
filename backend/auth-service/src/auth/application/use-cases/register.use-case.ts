import { Injectable, ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Auth } from '../../domain/entities/auth.entity';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { AuthToken } from 'src/auth/domain/entities/authtoken.entity';
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { ROLE_REPOSITORY } from "../../domain/repositories/role.repository.interface";
import type { IRoleRepository } from "../../domain/repositories/role.repository.interface";

@Injectable()
export class RegisterUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) { console.log('✅ RegisterUseCase constructor called'); }

    async execute(email: string, password: string): Promise<AuthToken> {
        if (!Auth.isValidEmail(email)) {
            throw new ConflictException('Invalid email format');
        }

        const sanitizedEmail = Auth.sanitizeEmail(email);

        const existingUser = await this.authRepository.findByEmail(sanitizedEmail);
        if (existingUser) {
            throw new ConflictException('Email is already in use');
        }

        const volunteerRole = await this.roleRepository.findByName('volunteer');
        if (!volunteerRole) {
            throw new NotFoundException('Volunteer role does not exist');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const auth = await this.authRepository.create(
            sanitizedEmail,
            passwordHash,
            volunteerRole.id
        );

        const accessToken = this.jwtService.sign(
            {
                userId: auth.id,
                email: auth.email,
                roleId: auth.roleId,
                roleName: auth.role?.name,
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

        return new AuthToken(accessToken, refreshToken, 900, auth.id);
    }
}