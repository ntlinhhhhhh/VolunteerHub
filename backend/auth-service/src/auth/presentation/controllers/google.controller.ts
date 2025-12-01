import { Controller, Get, Query, Res, InternalServerErrorException } from '@nestjs/common';
import { GoogleLoginUseCase } from 'auth/application/use-cases/google-login.use-case';
import express from 'express';

@Controller('auth/google')
export class GoogleController {
  constructor(private readonly googleLoginUseCase: GoogleLoginUseCase) {}

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

      res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${accessToken}`);
    } catch (error) {
      console.error('Google callback error:', error);
      throw new InternalServerErrorException('Google login failed');
    }
  }
}
