import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject(IUserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(authId: string, email: string, username: string, fullName: string, avatar?: string): Promise<User> {
        const existing = await this.userRepository.findByAuthId(authId);
        if (existing) {
            throw new ConflictException('User profile is exist');
        }

        // Tạo user profile
        return await this.userRepository.create({
            authId,
            email,
            username,
            fullName,
            avatar,
        });
    }
}