import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY } from 'src/auth/domain/repositories/auth.repository.interface';
import type { IAuthRepository } from 'src/auth/domain/repositories/auth.repository.interface';
import { UserSummary } from '../dto/user-summary.dto';

@Injectable()
export class GetUserSummaryUseCase {
    constructor(@Inject(AUTH_REPOSITORY)
            private readonly authRepository: IAuthRepository,) { }

    async execute(): Promise<UserSummary> {
        const [
            total,
            byRole,
            byStatus,
            newToday,
            newWeek,
            newMonth,
        ] = await Promise.all([
            this.authRepository.countAll(),
            this.authRepository.countGroupByRole(),
            this.authRepository.countGroupByStatus(),
            this.authRepository.countNewUsers('day'),
            this.authRepository.countNewUsers('week'),
            this.authRepository.countNewUsers('month'),
        ]);

        return {
            total,
            byRole,
            byStatus,
            newUsersToday: newToday,
            newUsersThisWeek: newWeek,
            newUsersThisMonth: newMonth,
        };
    }
}
