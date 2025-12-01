import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GoogleTokenResponseDto } from 'auth/application/dto/google-token-response.dto';
import { GoogleUserProfileDto } from 'auth/application/dto/google-user-profile.dto';
import axios from 'axios';

@Injectable()
export class GoogleAuthService {
  private clientId = process.env.GOOGLE_CLIENT_ID!;
  private clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  private redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  async getTokensFromCode(code: string): Promise<GoogleTokenResponseDto> {
    try {
      const params = new URLSearchParams();
      params.append('code', code);
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('redirect_uri', this.redirectUri);
      params.append('grant_type', 'authorization_code');

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
