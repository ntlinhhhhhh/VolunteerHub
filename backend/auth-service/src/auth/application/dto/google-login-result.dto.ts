import { GoogleUserProfileDto } from './google-user-profile.dto';

export class GoogleLoginResultDto {
    accessToken: string;
    refreshToken: string;
    profile: GoogleUserProfileDto;
    user?: any;
}