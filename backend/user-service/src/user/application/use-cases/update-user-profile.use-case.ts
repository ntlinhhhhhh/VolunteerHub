import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: string, data: Partial<User>): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    return await this.userRepository.update(userId, data);
  }
}