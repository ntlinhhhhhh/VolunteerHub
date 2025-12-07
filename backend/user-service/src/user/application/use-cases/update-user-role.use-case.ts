// import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
// import { IUserRepository } from '../../domain/repositories/user.repository.interface';
// import { User } from '../../domain/entities/user.entity';

// @Injectable()
// export class UpdateUserRoleUseCase {
//     constructor(
//         @Inject(IUserRepository)
//         private readonly userRepository: IUserRepository
//     ) { }

//     async execute(userId: string, role: string): Promise<User> {
//         // Validate role
//         const validRoles = ['volunteer', 'event_manager', 'admin'];
//         if (!validRoles.includes(role)) {
//             throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
//         }

//         const user = await this.userRepository.findById(userId);
//         if (!user) {
//             throw new NotFoundException('User not found');
//         }

//         user.setRole(role);
//         await this.userRepository.save(user);

//         return user;
//     }
// }