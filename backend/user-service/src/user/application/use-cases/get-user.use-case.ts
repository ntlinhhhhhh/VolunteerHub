import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class GetUserUseCase {
    constructor(
        @Inject(IUserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(): Promise<{ users: User[]; total: number }> {
        const user = await this.userRepository.findAll();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
}