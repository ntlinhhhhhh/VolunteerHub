import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IAuthRepository } from "auth/domain/repositories/auth.repository.interface";

@Injectable()
export class LockUserUseCase {
    constructor(
        @Inject(IAuthRepository)
        private readonly authRepository: IAuthRepository
    ) {}

    async execute(userId: string, reason: string): Promise<void> {
        const user = await this.authRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.isAccountLocked()) {
            throw new ConflictException('The account is already locked');
        }

        await this.authRepository.lockAccount(userId, reason || 'Account locked by admin');
    }
}