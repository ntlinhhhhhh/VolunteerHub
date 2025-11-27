
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class LogOutUseCase {
    [x: string]: any;
  constructor(
    @Inject(IAuthRepository)
    private readonly jwtService: JwtService
  ) {}

    async execute(refreshToken: string){
    try {
        const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
        });
        const userId = payload.sub;

        const storedToken = await this.redisClient.get(`refresh:${userId}`);
        if (storedToken && storedToken === refreshToken) {
        await this.redisClient.del(`refresh:${userId}`);
        }

        return { message: 'Logged out successfully' };
    } catch (err) {
        throw new UnauthorizedException('Invalid token');
    }
    }
}


