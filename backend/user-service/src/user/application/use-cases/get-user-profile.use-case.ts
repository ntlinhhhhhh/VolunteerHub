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
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async executeByAuthId(authId: string): Promise<User> {
        const user = await this.userRepository.findByAuthId(authId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async executeByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async executeAll(): Promise<{ users: User[]; total: number }> {
        const user = await this.userRepository.findAll();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    // async search(keyword: string, role?: string, page = 1, limit = 20) {
    //     return this.userRepository.search(keyword, role, page, limit);
    // }
}