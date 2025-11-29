import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UpdateUserProfileUseCase {
    constructor(
        @Inject(IUserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(authId: string, data: Partial<User>): Promise<User> {
        const user = await this.userRepository.findByAuthId(authId);
        if (!user) {
            throw new NotFoundException('user not found');
        }

        return await this.userRepository.update(user.id, data);
    }
}