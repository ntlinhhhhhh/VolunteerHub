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
import { RegisterDto } from '../dto/register.dto';
import { MessagePublisherService } from 'src/auth/infrastructure/messaging/message-publisher.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RegisterUseCase {
    constructor(
        @Inject('USER_SERVICE') private userClient: ClientProxy,
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly messagePublisherService: MessagePublisherService,
    ) { console.log('✅ RegisterUseCase constructor called'); }

    async execute(registerDto: RegisterDto): Promise<AuthToken> {
        if (!Auth.isValidEmail(registerDto.email)) {
            throw new ConflictException('Invalid email format');
        }

        const sanitizedEmail = Auth.sanitizeEmail(registerDto.email);

        const existingUser = await this.authRepository.findByEmail(sanitizedEmail);
        if (existingUser) {
            throw new ConflictException('Email is already in use');
        }

        const userProfile = await firstValueFrom(
            this.userClient.send('user.findByUsername', {
                username: registerDto.username
            }));

        if (userProfile) {
            throw new ConflictException('Username is exist');
        }

        console.log("userProfile", userProfile);

        const volunteerRole = await this.roleRepository.findByName('volunteer');
        if (!volunteerRole) {
            throw new NotFoundException('Volunteer role does not exist');
        }

        const passwordHash = await bcrypt.hash(registerDto.password, 10);

        const auth = await this.authRepository.create(
            sanitizedEmail,
            passwordHash,
            volunteerRole.id
        );

        await firstValueFrom(
            this.userClient.send('user.create', {
                authId: auth.id,
                email: registerDto.email,
                username: registerDto.username,
                fullName: registerDto.fullName
            }));

        await this.messagePublisherService.publishUserRegistered(auth.id, registerDto.email, registerDto.fullName);

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