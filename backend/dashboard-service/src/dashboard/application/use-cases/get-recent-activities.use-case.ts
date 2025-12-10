import { Injectable, Inject } from '@nestjs/common';
import { IDashboardRepository } from '../../domain/repositories/dashboard.repository.interface';
import { RecentActivity } from '../../domain/entities/recent-activity.entity';

@Injectable()
export class GetRecentActivitiesUseCase {
  constructor(
    @Inject(IDashboardRepository)
    private readonly dashboardRepository: IDashboardRepository
  ) {}

  async execute(limit: number = 20): Promise {
    return this.dashboardRepository.findRecentActivities(limit);
  }
}