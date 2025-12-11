import { Injectable, Inject } from '@nestjs/common';
import { IDashboardRepository } from '../../domain/repositories/dashboard.repository.interface';
import { TrendingEvent } from '../../domain/entities/trending-event.entity';

@Injectable()
export class GetTrendingEventsUseCase {
  constructor(
    @Inject(IDashboardRepository)
    private readonly dashboardRepository: IDashboardRepository
  ) {}

  async execute(limit: number = 10): Promise<TrendingEvent[]> {
    return this.dashboardRepository.findTrendingEvents(limit);
  }
}