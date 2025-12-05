import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";

@Injectable()
export class LockUserUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        private readonly rabbitmq: AmqpConnection,
    ) { console.log('✅ LockUserUseCase constructor called'); }

    async execute(userId: string, reason: string): Promise<void> {
        const user = await this.authRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.isAccountLocked()) {
            throw new ConflictException('The account is already locked');
        }

        await this.authRepository.lockAccount(userId, reason || 'Account locked by admin');

        await this.rabbitmq.publish(
            'notification_exchange',
            'user.locked',
            {
                type: 'user_locked',
                userId: userId,
                reason: reason,
                recipient: user.email,
                data: {}
            }
        );
    }
}