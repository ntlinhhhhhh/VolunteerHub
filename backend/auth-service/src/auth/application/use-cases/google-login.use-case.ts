import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { IAuthRepository } from 'auth/domain/repositories/auth.repository.interface';
import { IRoleRepository } from 'auth/domain/repositories/role.repository.interface';
import { GoogleAuthService } from 'auth/infrastructure/google/google-auth.service';
import { GoogleUserProfile } from '../dto/google-user-profile.dto';

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    @Inject(IAuthRepository) private readonly authRepository: IAuthRepository,
    @Inject(IRoleRepository) private readonly roleRepository: IRoleRepository,
    private readonly jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  async execute(code: string) {
    console.log('//1️⃣ Lấy token từ Google');
    const tokenData = await this.googleAuthService.getTokensFromCode(code);

    // 2️⃣ Lấy profile từ Google
    const profile: GoogleUserProfile = await this.googleAuthService.getUserProfile(tokenData.access_token);

    // 3️⃣ Tìm hoặc tạo auth
    let auth = await this.authRepository.findByEmail(profile.email);
    if (!auth) {
      const volunteerRole = await this.roleRepository.findByName('volunteer');
      if (!volunteerRole) throw new Error('Volunteer role does not exist');

      auth = await this.authRepository.create(profile.email, null, volunteerRole.id);
    }

    // 4️⃣ Tìm hoặc tạo user
    let user = await firstValueFrom(this.userClient.send('user.findByEmail', { email: profile.email }));
    if (!user?.data) {
      user = await firstValueFrom(this.userClient.send('user.create', {
        authId: auth.id,
        email: profile.email,
        username: profile.email.split('@')[0],
        fullName: profile.name,
        avatar: profile.picture,
      }));
    }

    // 5️⃣ Tạo JWT
    const accessToken = this.jwtService.sign({ sub: auth.id }, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ sub: auth.id, type: 'refresh' }, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return { accessToken, refreshToken };
  }
}
