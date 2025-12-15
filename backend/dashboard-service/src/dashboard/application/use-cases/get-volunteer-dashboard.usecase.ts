import { Injectable, HttpException, HttpStatus, Inject, Logger } from '@nestjs/common';
import { GetVolunteerDashboardDto } from '../dto/volunteer-dashboard.dto';
import { UserRole, VolunteerDashboard } from '../../domain/entities/volunteer-dashboard.entity';
import type { IDashboardRepository } from '../../domain/repositories/dashboard.repository.interface';
import type { ICacheService } from '../../domain/repositories/dashboard-cache.repository.interface';
import { ScoreCalculatorService } from '../../domain/services/score-calculator.service';
import { TrendAnalysisService } from '../../domain/services/trend-analysis.service';

@Injectable()
export class GetVolunteerDashboardUseCase {
    private readonly logger = new Logger(GetVolunteerDashboardUseCase.name);

    constructor(
        @Inject('IDashboardRepository')
        private readonly dashboardRepo: IDashboardRepository,
        @Inject('ICacheService')
        private readonly cacheService: ICacheService,
        private readonly scoreCalculator: ScoreCalculatorService,
        private readonly trendAnalysis: TrendAnalysisService,
    ) { }

    async execute(dto: GetVolunteerDashboardDto): Promise<VolunteerDashboard> {
        try {
            const cacheKey = `dashboard:volunteer:${dto.userId}:${dto.period}`;

            // Check cache first
            const cached = await this.cacheService.get(cacheKey);
            if (cached) {
                this.logger.log(`Cache HIT for ${cacheKey}`);
                return JSON.parse(cached);
            }

            this.logger.log(`Cache MISS for ${cacheKey}, building dashboard...`);

            // Fetch metrics from repository
            const metrics = await this.dashboardRepo.getVolunteerMetrics(dto.userId, dto.period);

            if (!metrics) {
                throw new HttpException(
                    `No data found for user ${dto.userId}`,
                    HttpStatus.NOT_FOUND
                );
            }

            // Fetch additional data in parallel
            const [badges, achievements, rank, streak] = await Promise.all([
                this.dashboardRepo.getVolunteerBadges(dto.userId),
                this.dashboardRepo.getVolunteerAchievements(dto.userId),
                this.dashboardRepo.getVolunteerRank(dto.userId),
                this.dashboardRepo.getVolunteerStreak(dto.userId),
            ]);

            // Build dashboard with calculated metrics
            const dashboard: VolunteerDashboard = {
                userId: dto.userId,
                role: UserRole.VOLUNTEER,
                period: dto.period,
                overview: {
                    totalHoursVolunteered: metrics.totalHours || 0,
                    monetaryValue: this.scoreCalculator.calculateMonetaryValue(metrics.totalHours || 0),
                    eventsRegistered: metrics.eventsRegistered || 0,
                    eventsCompleted: metrics.eventsCompleted || 0,
                    upcomingEvents: metrics.upcomingEvents || 0,
                    completionRate: this.scoreCalculator.calculateCompletionRate(
                        metrics.eventsCompleted || 0,
                        metrics.eventsRegistered || 0
                    ),
                    attendanceRate: this.scoreCalculator.calculateAttendanceRate(
                        metrics.volunteersAttended || 0,
                        metrics.volunteersRegistered || 0
                    ),
                    averageHoursPerEvent: metrics.averageHoursPerEvent || 0,
                    streak
                },
                gamification: {
                    currentLevel: this.scoreCalculator.calculateLevel(metrics.totalPoints || 0),
                    pointsEarned: metrics.totalPoints || 0,
                    pointsToNextLevel: this.scoreCalculator.getPointsToNextLevel(metrics.totalPoints || 0),
                    badges,
                    rank,
                    achievements
                },
                myEvents: metrics.myEvents || {
                    registered: [],
                    inProgress: [],
                    completed: [],
                    needAction: []
                },
                trends: {
                    hoursPerMonth: metrics.hoursPerMonth || [],
                    eventsPerMonth: metrics.eventsPerMonth || [],
                    attendanceTrend: this.trendAnalysis.calculateTrendData(
                        metrics.attendanceSparkline || [0]
                    ),
                },
                recentActivities: metrics.recentActivities || [],
                notifications: metrics.notifications || [],
                unreadMessages: metrics.unreadMessages || 0,
                recommendedEvents: metrics.recommendedEvents || [],
                impact: metrics.impact || {
                    totalPeopleHelped: 0,
                    totalProjectsCompleted: 0,
                    topSkillsUsed: [],
                    favoriteCauses: []
                }
            };

            // Cache the result (5 minutes TTL)
            await this.cacheService.set(cacheKey, JSON.stringify(dashboard), 300);
            this.logger.log(`Dashboard cached for ${cacheKey}`);

            return dashboard;

        } catch (error) {
            this.logger.error(`Error building volunteer dashboard: ${error.message}`, error.stack);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                'Failed to build volunteer dashboard',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
