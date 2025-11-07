import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { IAuthRepository } from "src/domain/repositories/auth.repository.interface";

@Injectable()
export class LockUserUseCase {
    constructor(
        @Inject(IAuthRepository)
        private readonly authRepository: IAuthRepository
    ) {};

    async execute(userId: string, reason: string): Promise<void> {
        const user = await this.authRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not exist');
        }

        if (user.isAccountLocked()) {
            throw new ConflictException('An account is locked');
        }

        await this.authRepository.lockAccount(userId, reason || 'Locked by admin')
    }
}