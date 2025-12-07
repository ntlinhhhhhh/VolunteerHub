import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class DeleteUserUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY) 
        private readonly authRepository: IAuthRepository,
    ) { }

    async execute(authId: string): Promise<void> {
        const auth = await this.authRepository.findById(authId);
        if (!auth) {
            throw new NotFoundException('User not found');
        }

        await this.authRepository.delete(authId);
    }
}