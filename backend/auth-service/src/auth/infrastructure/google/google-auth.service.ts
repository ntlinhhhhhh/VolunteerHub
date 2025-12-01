import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleTokenResponseDto } from 'auth/application/dto/google-token-response.dto';
import { GoogleUserProfileDto } from 'auth/application/dto/google-user-profile.dto';
import axios from 'axios';

@Injectable()
export class GoogleAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID')!;
    this.clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET')!;
    this.redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI')!;
  }

  async getTokensFromCode(code: string): Promise<GoogleTokenResponseDto> {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('redirect_uri', this.redirectUri);
    params.append('grant_type', 'authorization_code');

    console.log("params", params);

    try {
      const response = await axios.post<GoogleTokenResponseDto>(
        'https://oauth2.googleapis.com/token',
        params.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return response.data;
    } catch (err: any) {
      console.error('Google callback error:', err.response?.data || err.message);
      throw new UnauthorizedException('Failed to get Google tokens');
    }
  }

  async getProfile(accessToken: string): Promise<GoogleUserProfileDto> {
    try {
      const response = await axios.get<GoogleUserProfileDto>(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return response.data;
    } catch (err: any) {
      console.error('Google profile error:', err.response?.data || err.message);
      throw new UnauthorizedException('Failed to get Google profile');
    }
  }
}
