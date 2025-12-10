import { Injectable, Inject, Logger } from '@nestjs/common';
import { IDashboardRepository } from '../../domain/repositories/dashboard.repository.interface';
import { DashboardMessage } from '../dto/dashboard-message.dto';
import { ActivityType } from '../../domain/entities/recent-activity.entity';

@Injectable()
export class UpdateDashboardDataUseCase {
  private readonly logger = new Logger(UpdateDashboardDataUseCase.name);

  constructor(
    @Inject(IDashboardRepository)
    private readonly dashboardRepository: IDashboardRepository
  ) {}

  async execute(message: DashboardMessage): Promise<void> {
    this.logger.log(`Processing: ${message.type}`);

    switch (message.type) {
      case 'event_created':
        await this.handleEventCreated(message);
        break;
      case 'event_approved':
        await this.handleEventApproved(message);
        break;
      case 'registration_submitted':
        await this.handleRegistrationSubmitted(message);
        break;
      case 'registration_accepted':
        await this.handleRegistrationAccepted(message);
        break;
      case 'registration_completed':
        await this.handleRegistrationCompleted(message);
        break;
      case 'new_post_on_event':
        await this.handleNewPost(message);
        break;
      case 'new_comment_on_post':
        await this.handleNewComment(message);
        break;
      default:
        this.logger.warn(`Unknown message type: ${message.type}`);
    }
  }

  private async handleEventCreated(message: DashboardMessage): Promise<void> {
    const { eventId, eventName, eventDate, eventLocation, managerId, managerName } = message.data;

    // Create trending event record
    await this.dashboardRepository.upsertTrendingEvent({
      eventId,
      eventName,
      eventDate: new Date(eventDate),
      eventLocation,
      registrationCount: 0,
      lastActivityTimestamp: new Date(),
      trendScore: 0,
    } as any);

    // Create activity
    await this.dashboardRepository.createActivity({
      type: ActivityType.EVENT_CREATED,
      actorId: managerId,
      actorName: managerName,
      targetId: eventId,
      targetName: eventName,
      description: `${managerName} đã tạo sự kiện "${eventName}"`,
      metadata: { eventLocation, eventDate },
      timestamp: new Date(),
    } as any);

    // Update user stats
    await this.dashboardRepository.incrementUserStat(managerId, 'totalEventsCreated');
  }

  private async handleEventApproved(message: DashboardMessage): Promise<void> {
    const { eventId, eventName } = message.data;

    // Update event activity timestamp
    await this.dashboardRepository.updateEventActivity(eventId);

    // Create activity
    await this.dashboardRepository.createActivity({
      type: ActivityType.EVENT_APPROVED,
      actorId: 'admin',
      actorName: 'Admin',
      targetId: eventId,
      targetName: eventName,
      description: `Sự kiện "${eventName}" đã được phê duyệt`,
      metadata: message.data,
      timestamp: new Date(),
    } as any);
  }

  private async handleRegistrationSubmitted(message: DashboardMessage): Promise<void> {
    const { eventId, eventName, volunteerId, volunteerName } = message.data;

    // Increment registration count
    await this.dashboardRepository.incrementEventRegistrations(eventId);

    // Create activity
    await this.dashboardRepository.createActivity({
      type: ActivityType.USER_REGISTERED,
      actorId: volunteerId,
      actorName: volunteerName,
      targetId: eventId,
      targetName: eventName,
      description: `${volunteerName} đã đăng ký tham gia "${eventName}"`,
      metadata: message.data,
      timestamp: new Date(),
    } as any);
  }

  private async handleRegistrationAccepted(message: DashboardMessage): Promise<void> {
    const { eventId, volunteerId } = message.data;

    // Update event activity
    await this.dashboardRepository.updateEventActivity(eventId);

    // Update user stats
    await this.dashboardRepository.incrementUserStat(volunteerId, 'totalEventsJoined');

    // Create activity
    await this.dashboardRepository.createActivity({
      type: ActivityType.REGISTRATION_ACCEPTED,
      actorId: message.data.managerId || 'manager',
      actorName: message.data.managerName || 'Manager',
      targetId: eventId,
      targetName: message.data.eventName,
      description: `Đăng ký của ${message.data.volunteerName} đã được chấp nhận`,
      metadata: message.data,
      timestamp: new Date(),
    } as any);
  }

  private async handleRegistrationCompleted(message: DashboardMessage): Promise<void> {
    const { volunteerId } = message.data;

    // Update user stats
    await this.dashboardRepository.incrementUserStat(volunteerId, 'totalEventsCompleted');
  }

  private async handleNewPost(message: DashboardMessage): Promise<void> {
    const { eventId, postId, authorId, authorName, postTitle } = message.data;

    // Update event activity
    await this.dashboardRepository.updateEventActivity(eventId);

    // Update user stats
    await this.dashboardRepository.incrementUserStat(authorId, 'totalPostsCreated');

    // Create activity
    await this.dashboardRepository.createActivity({
      type: ActivityType.POST_CREATED,
      actorId: authorId,
      actorName: authorName,
      targetId: postId,
      targetName: postTitle || 'Bài viết mới',
      description: `${authorName} đã đăng bài viết mới`,
      metadata: message.data,
      timestamp: new Date(),
    } as any);
  }

  private async handleNewComment(message: DashboardMessage): Promise<void> {
    const { eventId, authorId } = message.data;

    // Update event activity
    await this.dashboardRepository.updateEventActivity(eventId);

    // Update user stats
    await this.dashboardRepository.incrementUserStat(authorId, 'totalCommentsCreated');

    // Create activity
    await this.dashboardRepository.createActivity({
      type: ActivityType.COMMENT_CREATED,
      actorId: message.data.authorId,
      actorName: message.data.authorName,
      targetId: message.data.postId,
      targetName: 'Bình luận',
      description: `${message.data.authorName} đã bình luận`,
      metadata: message.data,
      timestamp: new Date(),
    } as any);
  }
}