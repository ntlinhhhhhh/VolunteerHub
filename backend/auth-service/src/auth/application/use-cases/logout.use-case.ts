import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Cache } from 'cache-manager';

@Injectable()
export class LogOutUseCase {
    constructor(
        private readonly jwtService: JwtService,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,

    ) { }

    async execute(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            const userId = payload.sub;

            const storedToken = await this.cacheManager.get(`refresh:${userId}`);
            console.log(userId);
            if (!storedToken || storedToken !== refreshToken) {
                throw new UnauthorizedException('Invalid token');
            }

            await this.cacheManager.del(`refresh:${userId}`);

            return { message: 'Logged out successfully' };
        } catch (err) {
            console.error('Logout error:', err);
            throw new UnauthorizedException('Invalid token');
        }
    }
}
