import { TrendingEvent } from '../entities/trending-event.entity';
import { RecentActivity } from '../entities/recent-activity.entity';
import { UserStats } from '../entities/user-stats.entity';

export interface IDashboardRepository {
  // Trending Events
  findTrendingEvents(limit: number): Promise;
  upsertTrendingEvent(data: Partial): Promise;
  incrementEventRegistrations(eventId: string): Promise;
  updateEventActivity(eventId: string): Promise;

  // Recent Activities
  findRecentActivities(limit: number): Promise;
  createActivity(data: Partial): Promise;

  // User Stats
  findUserStats(userId: string): Promise;
  upsertUserStats(data: Partial): Promise;
  incrementUserStat(userId: string, field: string): Promise;

  // Admin Overview
  getTotalEvents(): Promise;
  getTotalUsers(): Promise;
  getTotalRegistrations(): Promise;
}

export const IDashboardRepository = Symbol('IDashboardRepository');