import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IDashboardRepository } from '../../domain/repositories/dashboard.repository.interface';
import { TrendingEvent as TrendingEventEntity } from '../../domain/entities/trending-event.entity';
import { RecentActivity as RecentActivityEntity } from '../../domain/entities/recent-activity.entity';
import { UserStats as UserStatsEntity } from '../../domain/entities/user-stats.entity';
import {
  TrendingEvent,
  TrendingEventDocument,
} from '../database/schemas/trending-event.schema';
import {
  RecentActivity,
  RecentActivityDocument,
} from '../database/schemas/recent-activity.schema';
import {
  UserStats,
  UserStatsDocument,
} from '../database/schemas/user-stats.schema';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  private readonly logger = new Logger(DashboardRepository.name);

  constructor(
    @InjectModel(TrendingEvent.name)
    private trendingEventModel: Model,
    @InjectModel(RecentActivity.name)
    private recentActivityModel: Model,
    @InjectModel(UserStats.name)
    private userStatsModel: Model
  ) {}

  // ========== TRENDING EVENTS ==========
  async findTrendingEvents(limit: number = 10): Promise {
    const docs = await this.trendingEventModel
      .find()
      .sort({ trendScore: -1 })
      .limit(limit)
      .exec();

    return docs.map(doc => this.toTrendingEventEntity(doc));
  }

  async upsertTrendingEvent(data: Partial): Promise {
    const doc = await this.trendingEventModel
      .findOneAndUpdate(
        { eventId: data.eventId },
        {
          $set: {
            eventName: data.eventName,
            eventDate: data.eventDate,
            eventLocation: data.eventLocation,
            registrationCount: data.registrationCount || 0,
            lastActivityTimestamp: data.lastActivityTimestamp || new Date(),
            trendScore: data.trendScore || 0,
          },
        },
        { upsert: true, new: true }
      )
      .exec();

    return this.toTrendingEventEntity(doc);
  }

  async incrementEventRegistrations(eventId: string): Promise {
    await this.trendingEventModel
      .updateOne(
        { eventId },
        {
          $inc: { registrationCount: 1 },
          $set: { lastActivityTimestamp: new Date() },
        }
      )
      .exec();

    // Recalculate trend score
    await this.recalculateTrendScore(eventId);
  }

  async updateEventActivity(eventId: string): Promise {
    await this.trendingEventModel
      .updateOne(
        { eventId },
        { $set: { lastActivityTimestamp: new Date() } }
      )
      .exec();

    await this.recalculateTrendScore(eventId);
  }

  private async recalculateTrendScore(eventId: string): Promise {
    const event = await this.trendingEventModel.findOne({ eventId }).exec();
    if (!event) return;

    // Simple scoring: registrations * 2 + (recent activities bonus)
    const daysSinceActivity = Math.floor(
      (Date.now() - event.lastActivityTimestamp.getTime()) / (1000 * 60 * 60 * 24)
    );
    const activityBonus = Math.max(0, 10 - daysSinceActivity);

    const trendScore = event.registrationCount * 2 + activityBonus;

    await this.trendingEventModel
      .updateOne({ eventId }, { $set: { trendScore } })
      .exec();
  }

  // ========== RECENT ACTIVITIES ==========
  async findRecentActivities(limit: number = 20): Promise {
    const docs = await this.recentActivityModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return docs.map(doc => this.toRecentActivityEntity(doc));
  }

  async createActivity(data: Partial): Promise {
    const doc = new this.recentActivityModel({
      type: data.type,
      actorId: data.actorId,
      actorName: data.actorName,
      targetId: data.targetId,
      targetName: data.targetName,
      description: data.description,
      metadata: data.metadata || {},
      timestamp: data.timestamp || new Date(),
    });

    const saved = await doc.save();
    return this.toRecentActivityEntity(saved);
  }

  // ========== USER STATS ==========
  async findUserStats(userId: string): Promise {
    const doc = await this.userStatsModel.findOne({ userId }).exec();
    return doc ? this.toUserStatsEntity(doc) : null;
  }

  async upsertUserStats(data: Partial): Promise {
    const doc = await this.userStatsModel
      .findOneAndUpdate(
        { userId: data.userId },
        {
          $set: {
            totalEventsCreated: data.totalEventsCreated || 0,
            totalEventsJoined: data.totalEventsJoined || 0,
            totalEventsCompleted: data.totalEventsCompleted || 0,
            totalPostsCreated: data.totalPostsCreated || 0,
            totalCommentsCreated: data.totalCommentsCreated || 0,
            lastActivityAt: data.lastActivityAt || new Date(),
          },
        },
        { upsert: true, new: true }
      )
      .exec();

    return this.toUserStatsEntity(doc);
  }

  async incrementUserStat(userId: string, field: string): Promise {
    const update: any = {
      $inc: { [field]: 1 },
      $set: { lastActivityAt: new Date() },
    };

    await this.userStatsModel.updateOne({ userId }, update, { upsert: true }).exec();
  }

  // ========== ADMIN OVERVIEW ==========
  async getTotalEvents(): Promise {
    return this.trendingEventModel.countDocuments().exec();
  }

  async getTotalUsers(): Promise {
    return this.userStatsModel.countDocuments().exec();
  }

  async getTotalRegistrations(): Promise {
    const result = await this.trendingEventModel
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$registrationCount' },
          },
        },
      ])
      .exec();

    return result[0]?.total || 0;
  }

  // ========== ENTITY MAPPERS ==========
  private toTrendingEventEntity(doc: TrendingEventDocument): TrendingEventEntity {
    return new TrendingEventEntity(
      doc._id.toString(),
      doc.eventId,
      doc.eventName,
      doc.eventDate,
      doc.eventLocation,
      doc.registrationCount,
      doc.lastActivityTimestamp,
      doc.trendScore,
      doc.createdAt,
      doc.updatedAt
    );
  }

  private toRecentActivityEntity(doc: RecentActivityDocument): RecentActivityEntity {
    return new RecentActivityEntity(
      doc._id.toString(),
      doc.type,
      doc.actorId,
      doc.actorName,
      doc.targetId,
      doc.targetName,
      doc.description,
      doc.metadata,
      doc.timestamp,
      doc.createdAt
    );
  }

  private toUserStatsEntity(doc: UserStatsDocument): UserStatsEntity {
    return new UserStatsEntity(
      doc._id.toString(),
      doc.userId,
      doc.totalEventsCreated,
      doc.totalEventsJoined,
      doc.totalEventsCompleted,
      doc.totalPostsCreated,
      doc.totalCommentsCreated,
      doc.lastActivityAt,
      doc.createdAt,
      doc.updatedAt
    );
  }
}