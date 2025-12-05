import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcryptjs';  // ✅ Thêm import để hash password
import { GoogleTokenResponseDto } from '../dto/google-token-response.dto';
import { GoogleUserProfileDto } from '../dto/google-user-profile.dto';
import { GoogleLoginResultDto } from '../dto/google-login-result.dto';
import { GoogleAuthService } from 'src/auth/infrastructure/google/google-auth.service';
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { ROLE_REPOSITORY } from "../../domain/repositories/role.repository.interface";
import type { IRoleRepository } from "../../domain/repositories/role.repository.interface";

@Injectable()
export class GoogleLoginUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
        private readonly googleAuthService: GoogleAuthService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { console.log('✅ GoogleLoginUseCase constructor called'); }

    async execute(code: string): Promise<GoogleLoginResultDto> {
        try {
            const tokens: GoogleTokenResponseDto =
                await this.googleAuthService.getTokensFromCode(code);

            const profile: GoogleUserProfileDto =
                await this.googleAuthService.getProfile(tokens.access_token);

            // 3. Get volunteer role
            const volunteerRole = await this.roleRepository.findByName('volunteer');
            if (!volunteerRole) {
                throw new NotFoundException('Volunteer role does not exist');
            }

            // 4. Find or create auth & user
            let auth = await this.authRepository.findByEmail(profile.email);
            let user;

            if (!auth) {
                const tempPassword = Math.random().toString(36).slice(-16);
                const hashedPassword = await bcrypt.hash(tempPassword, 10);

                auth = await this.authRepository.create(
                    profile.email,
                    hashedPassword,
                    volunteerRole.id
                );

                user = await firstValueFrom(
                    this.userClient.send('user.create', {
                        authId: auth.id,
                        email: profile.email,
                        username: profile.given_name || profile.email.split('@')[0],
                        fullName: profile.name,
                        avatar: profile.picture,
                    })
                );
            } else {
                user = await firstValueFrom(
                    this.userClient.send('user.findByAuthId', { authId: auth.id })
                );

                if (!user) {
                    throw new NotFoundException('User not found');
                }
            }

            await this.authRepository.updateLastLogin(auth.id);

            const jwtPayload = {
                sub: user.id,
                email: user.email,
                authId: auth.id,
                roleId: auth.roleId,
                roleName: volunteerRole.name,
            };

            const accessToken = this.jwtService.sign(jwtPayload, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            });

            const refreshToken = this.jwtService.sign(jwtPayload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            });

            return {
                accessToken,
                refreshToken,
                profile,
                user,
            };

        } catch (err: any) {
            console.error('GoogleLoginUseCase error:', err);

            if (err instanceof NotFoundException) {
                throw err;
            }

            throw new UnauthorizedException(
                err.message || 'Google login failed'
            );
        }
    }
}