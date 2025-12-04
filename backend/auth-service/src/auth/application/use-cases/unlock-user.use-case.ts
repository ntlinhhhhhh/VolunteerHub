import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IAuthRepository } from "src/auth/domain/repositories/auth.repository.interface";

@Injectable()
export class UnlockUserUseCase {
  constructor(
    @Inject(IAuthRepository)
    private readonly authRepository: IAuthRepository
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isAccountLocked()) {
      throw new ConflictException('The account is not locked');
    }

    await this.authRepository.unlockAccount(userId);
  }
}