import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject(IUserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(authId: string, email: string, username: string, fullName: string): Promise<User> {
        // Check user đã tồn tại chưa
        const existing = await this.userRepository.findByAuthId(authId);
        if (existing) {
            throw new ConflictException('User profile đã tồn tại');
        }

        // Tạo user profile
        return await this.userRepository.create({
            authId,
            email,
            username,
            fullName,
        });
    }
}