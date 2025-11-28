import { Controller, Post, Body, HttpCode, HttpStatus, Get, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { ValidateTokenUseCase } from '../../application/use-cases/validate-token.use-case';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const token = await this.registerUseCase.execute(
      registerDto.email,
      registerDto.password
    );

    try {
    const result = await firstValueFrom(
      this.userClient.send('user.create', { 
        authId: token.authId,
        email: registerDto.email,
        fullName: registerDto.fullname
      }));
    } catch (err) {
      console.error('Error calling user service:', err);
    }

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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const token = await this.loginUseCase.execute(
      loginDto.email,
      loginDto.password
    );

    return {
      success: true,
      message: 'login succesful',
      data: {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresIn: token.expiresIn,
      }
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const token = await this.refreshTokenUseCase.execute(
      refreshTokenDto.refreshToken
    );
    console.log("hehe");
    return {
      success: true,
      message: 'Token refresh',
      data: {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresIn: token.expiresIn,
      }
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