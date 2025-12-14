import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseHttpClient } from './base-http.client';

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

@Injectable()
export class AuthServiceClient extends BaseHttpClient {
    constructor(configService: ConfigService) {
        super(
            configService,
            configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:8000/auth-service',
            'AuthService'
        );
    }

    /**
     * Verify JWT token
     */
    async verifyToken(token: string): Promise<TokenPayload> {
        return this.post<TokenPayload>(`/api/v1/auth/verify`, { token });
    }

    /**
     * Validate user permissions
     */
    async validatePermission(userId: string, resource: string, action: string, token?: string): Promise<boolean> {
        if (token) this.setAuthToken(token);
        
        const response = await this.post<{ allowed: boolean }>(`/api/v1/auth/permissions/validate`, {
            userId,
            resource,
            action
        });
        return response.allowed;
    }
}
