import { Injectable } from '@nestjs/common';
import { GoogleTokenResponse } from 'auth/application/dto/google-token-response.dto';
import { GoogleUserProfile } from 'auth/application/dto/google-user-profile.dto';
import axios from 'axios';

@Injectable()
export class GoogleAuthService {
  async getTokensFromCode(code: string): Promise<GoogleTokenResponse> {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', process.env.GOOGLE_CLIENT_ID!);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
    params.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI!);
    params.append('grant_type', 'authorization_code');

    const response = await axios.post<GoogleTokenResponse>(
      'https://oauth2.googleapis.com/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data;
  }

  async getUserProfile(accessToken: string): Promise<GoogleUserProfile> {
    const response = await axios.get<GoogleUserProfile>(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }
}
