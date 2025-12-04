import { Injectable, ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { Token } from '../../domain/entities/token.entity';
import { Auth } from '../../domain/entities/auth.entity';
import bcrypt from 'bcryptjs';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { AuthToken } from 'src/auth/domain/entities/authtoken.entity';
import { IRoleRepository } from 'src/auth/domain/repositories/role.repository.interface';

@Injectable()
export class RegisterUseCase {
    constructor(
        @Inject(IAuthRepository)
        private readonly authRepository: IAuthRepository,
        @Inject(IRoleRepository)
        private readonly roleRepository: IRoleRepository,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) { }

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
        console.log(volunteerRole);
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
                roleName: 'volunteer',
                permissions: auth.role?.permissions || [],
            },
            {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
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