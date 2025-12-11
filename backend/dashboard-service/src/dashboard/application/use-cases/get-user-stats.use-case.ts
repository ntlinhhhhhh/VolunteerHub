import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IDashboardRepository } from '../../domain/repositories/dashboard.repository.interface';
import { UserStats } from '../../domain/entities/user-stats.entity';

@Injectable()
export class GetUserStatsUseCase {
  constructor(
    @Inject(IDashboardRepository)
    private readonly dashboardRepository: IDashboardRepository
  ) {}

  async execute(userId: string): Promise<UserStats> {
    const stats = await this.dashboardRepository.findUserStats(userId);
    
    if (!stats) {
      // Create initial stats if not exists
      return this.dashboardRepository.upsertUserStats({
        userId,
        totalEventsCreated: 0,
        totalEventsJoined: 0,
        totalEventsCompleted: 0,
        totalPostsCreated: 0,
        totalCommentsCreated: 0,
        lastActivityAt: new Date(),
      } as any);
    }

    return stats;
  }
}