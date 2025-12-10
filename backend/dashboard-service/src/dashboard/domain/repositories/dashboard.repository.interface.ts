import { TrendingEvent } from '../entities/trending-event.entity';
import { RecentActivity } from '../entities/recent-activity.entity';
import { UserStats } from '../entities/user-stats.entity';

export interface IDashboardRepository {
  // Trending Events
  findTrendingEvents(limit: number): Promise<TrendingEvent[]>;
  upsertTrendingEvent(data: Partial<TrendingEvent>): Promise<TrendingEvent>;
  incrementEventRegistrations(eventId: string): Promise<void>;
  updateEventActivity(eventId: string): Promise<void>;

  // Recent Activities
  findRecentActivities(limit: number): Promise<RecentActivity[]>;
  createActivity(data: Partial<RecentActivity>): Promise<RecentActivity>;

  // User Stats
  findUserStats(userId: string): Promise<UserStats | null>;
  upsertUserStats(data: Partial<UserStats>): Promise<UserStats>;
  incrementUserStat(userId: string, field: string): Promise<void>;

  // Admin Overview
  getTotalEvents(): Promise<number>;
  getTotalUsers(): Promise<number>;
  getTotalRegistrations(): Promise<number>;
}

export const IDashboardRepository = Symbol('IDashboardRepository');