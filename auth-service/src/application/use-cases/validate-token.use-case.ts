import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ValidateTokenUseCase {
  constructor(private readonly jwtService: JwtService) {}

  async execute(token: string): Promise<{ valid: boolean; userId?: string, email?: string }> {
    try {
      const payload = this.jwtService.verify(token);
      return { 
        valid: true, 
        userId: payload.userId,
        email: payload.email  
      };
    } catch (error) {
      return { valid: false };
    }
  }
}