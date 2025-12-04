import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
    handleRequest(err, user, info) {
        // Nếu Passport báo lỗi hoặc token không hợp lệ, trả Unauthorized
        if (err || !user) {
            console.log('Refresh token invalid', err, info); // log debug
            throw new UnauthorizedException('Invalid refresh token');
        }
        return user;
    }
}
