import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { MessagePublisherService } from "src/auth/infrastructure/messaging/message-publisher.service";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class UnlockUserUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        private readonly messagePublisherService: MessagePublisherService,
        @Inject('USER_SERVICE') private userClient: ClientProxy,
    ) { console.log('✅ UnlockUserUseCase constructor called'); }

    async execute(authId: string): Promise<void> {
        const user = await this.authRepository.findById(authId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.isAccountLocked()) {
            throw new ConflictException('The account is not locked');
        }

        await this.authRepository.unlockAccount(authId);

        const user_profile = await firstValueFrom(
            this.userClient.send('user.findByEmail', {
                email: user.email,
            }));

        await this.messagePublisherService.publishUnlockUser(authId, user.email, user_profile.fullName);
    }
}