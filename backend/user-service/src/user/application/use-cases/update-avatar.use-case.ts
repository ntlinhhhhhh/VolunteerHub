import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UpdateAvatarUseCase {
    constructor(@Inject(IUserRepository) private readonly userRepository: IUserRepository,) { }


    async execute(userId: string, file: Express.Multer.File): Promise<string> {
        if (!file) throw new BadRequestException('No file provided');

        const user = await this.userRepository.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        // Lấy extension từ file upload
        const ext = path.extname(file.originalname);

        // Tên file mới theo username
        const newFileName = `${user.username}${ext}`;

        // Đường dẫn lưu trong thư mục
        const newFilePath = path.join(file.destination, newFileName);

        // Xóa file cũ nếu có
        if (fs.existsSync(newFilePath)) {
            fs.unlinkSync(newFilePath);
        }

        // Đổi tên file
        fs.renameSync(file.path, newFilePath);

        // Lưu vào DB để frontend load avatar
        const avatarPath = `/uploads/avatars/${newFileName}`;
        await this.userRepository.updateAvatar(userId, avatarPath);
        return avatarPath;
    }
}
