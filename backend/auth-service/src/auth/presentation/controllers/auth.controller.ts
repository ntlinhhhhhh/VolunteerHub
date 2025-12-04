import { Controller, Post, Body, HttpCode, HttpStatus, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { ValidateTokenUseCase } from '../../application/use-cases/validate-token.use-case';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { firstValueFrom } from 'rxjs';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { LogOutUseCase } from 'src/auth/application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from 'src/auth/application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from 'src/auth/application/use-cases/reset-password.use-case';
import { LogoutDto } from 'src/auth/application/dto/logout.dto';
import { Public } from '@share/auth/public.decorator';
import { AdminLoginUseCase } from 'src/auth/application/use-cases/admin-login.use-case';
import { EventManagerLoginUseCase } from 'src/auth/application/use-cases/event-manager.use-case';
import { RefreshTokenGuard } from '@share/auth/refresh-token.guard';
import { Roles } from '@share/auth/roles.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly adminLoginUseCase: AdminLoginUseCase,
        private readonly eventManagerLoginUseCase: EventManagerLoginUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        private readonly validateTokenUseCase: ValidateTokenUseCase,
        private readonly logoutUseCase: LogOutUseCase,
        @Inject('USER_SERVICE') private userClient: ClientProxy,
        private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
        private readonly resetPasswordUseCase: ResetPasswordUseCase,
        private readonly rabbitmq: AmqpConnection,
    ) { }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto) {
        const token = await this.registerUseCase.execute(
            registerDto.email,
            registerDto.password
        );

        console.log(registerDto.username);

        try {
            await firstValueFrom(
                this.userClient.send('user.create', {
                    authId: token.authId,
                    email: registerDto.email,
                    username: registerDto.username,
                    fullName: registerDto.fullName
                }));
        } catch (err) {
            console.error('Error calling user service:', err);
        }

        this.rabbitmq.publish(
            'notification_exchange',
            'user.registered',
            {
                type: 'user_registered',
                userId: token.authId,
                recipient: registerDto.email,
                fullName: registerDto.fullName,
                data: {}
            }
        );

        return {
            success: true,
            message: 'register succesful',
            data: {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                expiresIn: token.expiresIn,
            }
        };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        const token = await this.loginUseCase.execute(
            loginDto.email,
            loginDto.password
        );

        return {
            success: true,
            message: 'Volunteer login succesful',
            data: {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                expiresIn: token.expiresIn,
            }
        };
    }

    @Roles('admin')
    @Post('admin/login')
    @HttpCode(HttpStatus.OK)
    async adminLogin(@Body() loginDto: LoginDto) {
        const token = await this.adminLoginUseCase.execute(
            loginDto.email,
            loginDto.password
        );

        return {
            success: true,
            message: 'Admin login succesful',
            data: {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                expiresIn: token.expiresIn,
            }
        };
    }

    @Roles('event_manager')
    @Post('event-manager/login')
    @HttpCode(HttpStatus.OK)
    async eventManagerLogin(@Body() loginDto: LoginDto) {
        const token = await this.eventManagerLoginUseCase.execute(
            loginDto.email,
            loginDto.password
        );

        return {
            success: true,
            message: 'Event manager login succesful',
            data: {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                expiresIn: token.expiresIn,
            }
        };
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        try {
            const token = await this.refreshTokenUseCase.execute(
                refreshTokenDto.refreshToken
            );
            console.log('Refreshed token:', token);

            return {
                success: true,
                message: 'Token refreshed',
                data: {
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken,
                    expiresIn: token.expiresIn,
                }
            };
        } catch (err) {
            console.error('Error refreshing token:', err);
            return {
                success: false,
                message: err.message || 'Unknown error',
            };
        }
    }


    @Public()
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.forgotPasswordUseCase.execute(email);
    }

    @Public()
    @Post('reset-password')
    async resetPassword(@Body() body: { email: string; token: string; newPassword: string }) {
        return this.resetPasswordUseCase.execute(body.email, body.token, body.newPassword);
    }

    @Roles('ADMIN', 'EVENT_MANAGER', 'VOLUNTEER')
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Body() logoutDto: LogoutDto) {
        const result = await this.logoutUseCase.execute(logoutDto.refreshToken);

        return {
            success: true,
            message: result.message,
        };
    }

    @MessagePattern('auth.validate')
    async validateToken(@Payload() data: { token: string }) {
        return await this.validateTokenUseCase.execute(data.token);
    }

    @MessagePattern('auth.register')
    async registerFromService(@Payload() data: RegisterDto) {
        const token = await this.registerUseCase.execute(data.email, data.password);
        return {
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            expiresIn: token.expiresIn,
        };
    }

    @MessagePattern('auth.login')
    async loginFromService(@Payload() data: LoginDto) {
        const token = await this.loginUseCase.execute(data.email, data.password);
        return {
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            expiresIn: token.expiresIn,
        };
    }

    @MessagePattern('auth.refresh')
    async refreshFromService(@Payload() data: { refreshToken: string }) {
        const token = await this.refreshTokenUseCase.execute(data.refreshToken);
        return {
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            expiresIn: token.expiresIn,
        };
    }
}