import { Injectable, ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Auth } from "src/auth/domain/entities/auth.entity";
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { ROLE_REPOSITORY } from "../../domain/repositories/role.repository.interface";
import type { IRoleRepository } from "../../domain/repositories/role.repository.interface";
import { RegisterDto } from '../dto/register.dto';
import { MessagePublisherService } from 'src/auth/infrastructure/messaging/message-publisher.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CreateEventManagerUseCase {
    constructor(
        @Inject('USER_SERVICE') private userClient: ClientProxy,
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    ) { console.log('✅ RegisterUseCase constructor called'); }

    async execute(registerDto: RegisterDto): Promise<Auth> {
        if (!Auth.isValidEmail(registerDto.email)) {
            throw new ConflictException('Invalid email format');
        }

        const sanitizedEmail = Auth.sanitizeEmail(registerDto.email);

        const existingUser = await this.authRepository.findByEmail(sanitizedEmail);
        if (existingUser) {
            throw new ConflictException('Email is already in use');
        }

        const volunteerRole = await this.roleRepository.findByName('event_manager');
        if (!volunteerRole) {
            throw new NotFoundException('Event_manager role does not exist');
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
        return auth;
    }
}