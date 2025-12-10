import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UpdateAvatarUseCase {
    constructor(@Inject(IUserRepository) private readonly userRepository: IUserRepository,) { }

    async execute(userId: string, file: Express.Multer.File): Promise<string> {
        if (!file) throw new Error('No file provided');

        const avatarPath = `/uploads/avatars/${file.filename}`;
        await this.userRepository.updateAvatar(userId, avatarPath);
        return avatarPath;
    }
}
