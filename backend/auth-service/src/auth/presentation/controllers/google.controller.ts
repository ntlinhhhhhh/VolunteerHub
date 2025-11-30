import { Controller, Get, Query, Res } from '@nestjs/common';
import { GoogleLoginUseCase } from 'auth/application/use-cases/google-login.use-case';
import type { Response } from 'express';

@Controller('auth/google')
export class GoogleController {
  constructor(private readonly googleLoginUseCase: GoogleLoginUseCase) {}

  @Get('callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    if (!code) throw new Error('Authorization code not provided');

    const { accessToken } = await this.googleLoginUseCase.execute(code);

    // Redirect về frontend với token
    res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${accessToken}`);
  }
}
