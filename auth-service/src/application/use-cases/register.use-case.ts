import { Injectable, ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { Token } from '../../domain/entities/token.entity';
import { Auth } from '../../domain/entities/auth.entity';
import { IRoleRepository } from 'src/domain/repositories/role.repository.interface';
import bcrypt from 'node_modules/bcryptjs';
import { permission } from 'process';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository,
    @Inject(IRoleRepository)
    private readonly roleRepository: IRoleRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(email: string, password: string): Promise<Token> {
    // 1. validate email
    if (!Auth.isValidEmail(email)) {
      throw new ConflictException('Invalid Email');
    }
    
    // 2. sanitize email
    const sanitizeEmail = Auth.sanitizeEmail(email);

    // 3. check exist email
    const existingUser = await this.authRepository.findByEmail(sanitizeEmail);

    if (existingUser) {
      throw new ConflictException("Email is exists");
    }

    // 4. find role
    const volunteerRole = await this.roleRepository.findByName('volunteer');
    if (!volunteerRole) {
      throw new NotFoundException('Role volunteer is not exist');
    }

    // 5. hass password
    const passwordHash = await bcrypt.hash(password, 10);

    // create new user
    const auth = await this.authRepository.create(
      sanitizeEmail,
      passwordHash,
      volunteerRole.id
    );

    // genarate JWT tokens
    const accessToken = this.jwtService.sign(
      {
        userId: auth.id,
        email: auth.email,
        roleId: auth.roleId,
        roleName: 'volunteer',
        permission: volunteerRole.permissions
      },
      { expiresIn: '15m' }
    );

    const refreshToken = this.jwtService.sign(
      { userId: auth.id, type: 'refresh' },
      { expiresIn: '7d' }
    );

    return new Token(accessToken, refreshToken, 900);
  }
}