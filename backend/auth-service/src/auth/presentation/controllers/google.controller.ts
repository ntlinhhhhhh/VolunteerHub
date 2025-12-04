import { Controller, Get, Query, Res, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import { GoogleLoginUseCase } from 'src/auth/application/use-cases/google-login.use-case';

@Controller('auth/google')
export class GoogleController {
  constructor(
    private readonly googleLoginUseCase: GoogleLoginUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Get('callback')
  async googleCallback(@Query('code') code: string, @Res() res: express.Response) {
    if (!code) throw new InternalServerErrorException('Authorization code not provided');

    try {
      console.log("Google token request params:", {
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        client_id: process.env.GOOGLE_CLIENT_ID,
      });

        const { accessToken } = await this.googleLoginUseCase.execute(code);
        const frontendUrl = this.configService.get('FRONTEND_URL');
        res.redirect(`${frontendUrl}/login-success?token=${accessToken}`);

    } catch (error) {
      console.error('Google callback error:', error);
      throw new InternalServerErrorException('Google login failed');
    }
  }
}
