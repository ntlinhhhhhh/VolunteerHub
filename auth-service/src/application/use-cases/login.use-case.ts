import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { Token } from '../../domain/entities/token.entity';
import { IRoleRepository } from 'src/domain/repositories/role.repository.interface';
import { NotFoundError } from 'rxjs';
import { permission } from 'process';
import { Auth } from 'src/domain/entities/auth.entity';

@Injectable()
export class LoginUseCase {
  private readonly MAX_FAILED_ATTEMPTS = 5;

  constructor(
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(email: string, password: string): Promise<Token> {

    // 1. find user by email
    const auth = await this.authRepository.findByEmail(email);

    if (!auth) {
      throw new UnauthorizedException('Invalid email');
    }

    // 2. check lock account
    if (auth.isAccountLocked()) {
      throw new UnauthorizedException('Account is locked');
    }

    // 3. verify password
    const isPasswordValid = await bcrypt.compare(password, auth?.passwordHash);

    if (!isPasswordValid) {

      // passwprd sai --> increate attemps
      const attempts = await this.authRepository.incrementFailedLoginAttempts(auth.id);

      if (attempts >= 5) {
        await this.authRepository.lockAccount(
          auth.id,
          `locked account as ${attempts} login failed`
        );
        throw new UnauthorizedException(
          `locked account as ${attempts} login failed`
        );
      }

      throw new UnauthorizedException(
        `Email or password invalid.  Còn ${this.MAX_FAILED_ATTEMPTS - attempts} lần thử.`
      )
    }

    await this.authRepository.updateLastLogin(auth.id);

    // 4. gen payload
    const payload = {
      userId: auth.id,
      email: auth.email,
      roleId: auth.roleId,
      roleName: auth.role?.name,
      permission: auth.role?.permissions || [],
      isLocked: auth.isLocked
    };

console.log('JWT service:', this.jwtService);
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { userId: auth.id, type: 'refresh' },
      { expiresIn: '7d'}
    );
    console.log(accessToken)


    return new Token(accessToken, refreshToken, 900);
  }
}