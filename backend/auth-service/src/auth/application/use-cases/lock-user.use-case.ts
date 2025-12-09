import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AUTH_REPOSITORY } from "../../domain/repositories/auth.repository.interface";
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { MessagePublisherService } from "src/auth/infrastructure/messaging/message-publisher.service";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import type { IRoleRepository } from "src/auth/domain/repositories/role.repository.interface";
import { ROLE_REPOSITORY } from "src/auth/domain/repositories/role.repository.interface";

@Injectable()
export class LockUserUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
        @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
        private readonly messagePublisherService: MessagePublisherService,
        @Inject('USER_SERVICE') private userClient: ClientProxy,

    ) { console.log('✅ LockUserUseCase constructor called'); }

    async execute(authId: string, reason: string): Promise<void> {
        const user = await this.authRepository.findById(authId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const role = await this.roleRepository.findById(user.roleId);

        if (role?.name === 'admin') {
            throw new ConflictException('You do not have permission to lock this admin user');
        }

        if (user.isAccountLocked()) {
            throw new ConflictException('The account is already locked');
        }

        await this.authRepository.lockAccount(authId, reason || 'Account locked by admin');

        const user_profile = await firstValueFrom(
            this.userClient.send('user.findByEmail', {
                email: user.email,
            }));

        await this.messagePublisherService.publishLockUser(authId, user.email, user_profile.fullName, reason);
    }
}