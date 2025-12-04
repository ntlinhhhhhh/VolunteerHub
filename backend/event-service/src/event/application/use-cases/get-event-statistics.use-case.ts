import { Injectable, Inject } from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { EventStatus } from '../../domain/entities/event-status.enum';

export interface EventStatistics {
    totalEvents: number;
    byStatus: Record<EventStatus, number>;
    upcomingEvents: number;
    popularCategories: Array<{
        categoryId: string;
        categoryName: string;
        count: number;
    }>;
}

@Injectable()
export class GetEventStatisticsUseCase {
    constructor(
        @Inject(IEventRepository)
        private readonly eventRepository: IEventRepository
    ) { }

    async execute(): Promise<EventStatistics> {
        const [
            totalDraft,
            totalPending,
            totalApproved,
            totalPublished,
            totalOngoing,
            totalCompleted,
            totalCancelled,
            totalRejected,
            upcomingEvents,
            popularCategories,
        ] = await Promise.all([
            this.eventRepository.countByStatus(EventStatus.DRAFT),
            this.eventRepository.countByStatus(EventStatus.PENDING_APPROVAL),
            this.eventRepository.countByStatus(EventStatus.APPROVED),
            this.eventRepository.countByStatus(EventStatus.PUBLISHED),
            this.eventRepository.countByStatus(EventStatus.ONGOING),
            this.eventRepository.countByStatus(EventStatus.COMPLETED),
            this.eventRepository.countByStatus(EventStatus.CANCELLED),
            this.eventRepository.countByStatus(EventStatus.REJECTED),
            this.eventRepository.getUpcomingEvents(10),
            this.eventRepository.getPopularCategories(),
        ]);

        return {
            totalEvents:
                totalDraft +
                totalPending +
                totalApproved +
                totalPublished +
                totalOngoing +
                totalCompleted +
                totalCancelled +
                totalRejected,
            byStatus: {
                [EventStatus.DRAFT]: totalDraft,
                [EventStatus.PENDING_APPROVAL]: totalPending,
                [EventStatus.APPROVED]: totalApproved,
                [EventStatus.PUBLISHED]: totalPublished,
                [EventStatus.ONGOING]: totalOngoing,
                [EventStatus.COMPLETED]: totalCompleted,
                [EventStatus.CANCELLED]: totalCancelled,
                [EventStatus.REJECTED]: totalRejected,
            },
            upcomingEvents: upcomingEvents.length,
            popularCategories,
        };
    }
}