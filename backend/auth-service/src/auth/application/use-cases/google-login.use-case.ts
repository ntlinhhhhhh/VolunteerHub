import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GoogleTokenResponseDto } from '../dto/google-token-response.dto';
import { GoogleUserProfileDto } from '../dto/google-user-profile.dto';
import { GoogleLoginResultDto } from '../dto/google-login-result.dto';
import { GoogleAuthService } from 'auth/infrastructure/google/google-auth.service';
import { AuthRepository } from 'auth/infrastructure/repositories/auth.repository';
import { IRoleRepository } from 'auth/domain/repositories/role.repository.interface';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleLoginUseCase {
    constructor(
        private readonly googleAuthService: GoogleAuthService,
        private readonly authRepository: AuthRepository,
        @Inject(IRoleRepository)
        private readonly roleRepository: IRoleRepository,
        private readonly jwtService: JwtService,
        @Inject('USER_SERVICE') private userClient: ClientProxy
    ) { }

    async execute(code: string): Promise<GoogleLoginResultDto> {
        try {
            const tokens: GoogleTokenResponseDto =
                await this.googleAuthService.getTokensFromCode(code);

            const profile: GoogleUserProfileDto =
                await this.googleAuthService.getProfile(tokens.access_token);
        
            const volunteerRole = await this.roleRepository.findByName('volunteer');
            if (!volunteerRole) {
                throw new NotFoundException('Volunteer role does not exist');
            }
            
            let auth = await this.authRepository.findByEmail(profile.email);
            let user
            if (!auth) {
                const tempPassword = Math.random().toString(36).slice(-16);
                await this.authRepository.create(profile.email, tempPassword, volunteerRole.id);
                user = await firstValueFrom(
                this.userClient.send('user.create', {
                    authId: profile.id,
                    email: profile.email,
                    username: profile.given_name,
                    fullName: profile.name,
                }));
            } else {
                user = await firstValueFrom(this.userClient.send('user.findByEmail', { email: profile.email }));
            }

            const jwtPayload = { sub: user.id, email: user.email, name: user.fullName };
            const accessToken = this.jwtService.sign(jwtPayload, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: '15m',
            });
            const refreshToken = this.jwtService.sign(jwtPayload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '7d',
            });

            return { accessToken, refreshToken, profile };
        } catch (err: any) {
            console.error('GoogleLoginUseCase error:', err.response?.data || err.message);
            throw new UnauthorizedException('Google login failed');
        }
    }
}
