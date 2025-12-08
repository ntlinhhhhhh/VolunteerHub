import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";

@Injectable()
export class UnlockUserUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        private readonly rabbitmq: AmqpConnection,
    ) { console.log('✅ UnlockUserUseCase constructor called'); }

    async execute(userId: string): Promise<void> {
        const user = await this.authRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.isAccountLocked()) {
            throw new ConflictException('The account is not locked');
        }

        await this.authRepository.unlockAccount(userId);

        await this.rabbitmq.publish(
            'notification_exchange',
            'user.unlocked',
            {
                type: 'user_unlocked',
                userId: userId,
                recipient: user.email,
                data: {
                    message: 'Your account has been unlocked',
                }
            }
        );
    }
}