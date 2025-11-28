import { Injectable, ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { Token } from '../../domain/entities/token.entity';
import { Auth } from '../../domain/entities/auth.entity';
import bcrypt from 'bcryptjs';
import { IRoleRepository } from 'auth/domain/repositories/role.repository.interface';
import { AuthToken } from 'auth/domain/entities/authtoken.entity';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    @Inject(IRoleRepository)
    private readonly roleRepository: IRoleRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(email: string, password: string): Promise<AuthToken> {
    // 1. Validate email format
    if (!Auth.isValidEmail(email)) {
      throw new ConflictException('Invalid email format');
    }
    
    // 2. Sanitize email
    const sanitizedEmail = Auth.sanitizeEmail(email);

    // 3. Check if email already exists
    const existingUser = await this.authRepository.findByEmail(sanitizedEmail);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // 4. Find role 'volunteer'
    const volunteerRole = await this.roleRepository.findByName('volunteer');
    console.log(volunteerRole);
    if (!volunteerRole) {
      throw new NotFoundException('Volunteer role does not exist');
    }

    // 5. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 6. Create new user
    const auth = await this.authRepository.create(
      sanitizedEmail,
      passwordHash,
      volunteerRole.id
    );

    // 7. Generate JWT tokens
    const accessToken = this.jwtService.sign(
      {
        userId: auth.id,
        email: auth.email,
        roleId: auth.roleId,
        roleName: 'volunteer',
        permissions: volunteerRole.permissions
      },
      { expiresIn: '15m' }
    );

    const refreshToken = this.jwtService.sign(
      { userId: auth.id, type: 'refresh' },
      { expiresIn: '7d' }
    );

    return new AuthToken(accessToken, refreshToken, 900, auth.id);
  }
}