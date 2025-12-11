// import { Inject, Injectable, ConflictException, NotFoundException } from '@nestjs/common';
// import { IAuthRepository } from 'auth/domain/repositories/auth.repository.interface';
// import { IRoleRepository } from 'auth/domain/repositories/role.repository.interface';
// import { Auth } from 'auth/domain/entities/auth.entity';

// @Injectable()
// export class RegisterGoogleUseCase {
//   constructor(
//     @Inject(IAuthRepository)
//     private readonly authRepository: IAuthRepository,
//     @Inject(IRoleRepository)
//     private readonly roleRepository: IRoleRepository,
//   ) {}

//   async execute(email: string) {
//     if (!Auth.isValidEmail(email)) {
//       throw new ConflictException('Invalid email format');
//     }

//     const sanitizedEmail = Auth.sanitizeEmail(email);

//     const existing = await this.authRepository.findByEmail(sanitizedEmail);
//     if (existing) {
//       return existing;
//     }

//     const volunteerRole = await this.roleRepository.findByName('volunteer');
//     if (!volunteerRole) {
//       throw new NotFoundException('Volunteer role does not exist');
//     }

//     const auth = await this.authRepository.create(
//     sanitizedEmail,
//     null,
//     //   provider: 'google',
//     volunteerRole.id,
//     );

//     return auth;
//   }
// }
