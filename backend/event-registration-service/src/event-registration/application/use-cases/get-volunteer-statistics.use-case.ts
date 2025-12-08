import { Injectable, Inject } from '@nestjs/common';
import { IRegistrationRepository } from '../../domain/repositories/registration.repository.interface';
import { RegistrationStatus } from '../../domain/entities/registration-status.enum';

export interface VolunteerStatistics {
    totalRegistrations: number;
    totalHours: number;
    completedEvents: number;
    upcomingEvents: number;
    byStatus: Record<string, number>;
    averageRating: number | null;
}

@Injectable()
export class GetVolunteerStatisticsUseCase {
    constructor(
        @Inject(IRegistrationRepository)
        private readonly registrationRepository: IRegistrationRepository
    ) { }

    async execute(volunteerId: string): Promise<VolunteerStatistics> {
        const [
            totalRegistrations,
            totalHours,
            completedCount,
            upcomingRegistrations,
            allRegistrations,
        ] = await Promise.all([
            this.registrationRepository.countByVolunteer(volunteerId),
            this.registrationRepository.getTotalHoursByVolunteer(volunteerId),
            this.registrationRepository.countByStatus(RegistrationStatus.COMPLETED),
            this.registrationRepository.getUpcomingRegistrations(volunteerId, 10),
            this.registrationRepository.findByVolunteerId(volunteerId, { limit: 1000 }),
        ]);

        // Calculate status distribution
        const byStatus: Record<string, number> = {};
        Object.values(RegistrationStatus).forEach(status => {
            byStatus[status] = 0;
        });

        allRegistrations.data.forEach(reg => {
            byStatus[reg.status] = (byStatus[reg.status] || 0) + 1;
        });

        // Calculate average rating from organizer feedback
        const ratedRegistrations = allRegistrations.data.filter(
            reg => reg.completion.organizerFeedback
        );

        let averageRating: number | null = null;
        if (ratedRegistrations.length > 0) {
            const totalRating = ratedRegistrations.reduce((sum, reg) => {
                const feedback = reg.completion.organizerFeedback!;
                return sum + (feedback.performance + feedback.punctuality + feedback.teamwork) / 3;
            }, 0);
            averageRating = Math.round((totalRating / ratedRegistrations.length) * 10) / 10;
        }

        return {
            totalRegistrations,
            totalHours: Math.round(totalHours * 10) / 10,
            completedEvents: completedCount,
            upcomingEvents: upcomingRegistrations.length,
            byStatus,
            averageRating,
        };
    }
}