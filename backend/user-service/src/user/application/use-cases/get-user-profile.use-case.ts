import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class GetUserProfileUseCase {
    constructor(
        @Inject(IUserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<User> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User không tồn tại');
        }
        return user;
    }

    async executeByAuthId(authId: string): Promise<User> {
        const user = await this.userRepository.findByAuthId(authId);
        if (!user) {
            throw new NotFoundException('User không tồn tại');
        }
        return user;
    }
}