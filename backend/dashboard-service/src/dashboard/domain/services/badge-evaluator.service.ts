export interface BadgeRequirement {
    eventsCompleted: number;
    hoursCompleted?: number; // optional
}

export const BADGE_REQUIREMENTS: Record<string, BadgeRequirement> = {
    NEWCOMER: { eventsCompleted: 1 },
    REGULAR: { eventsCompleted: 5 },
    DEDICATED: { eventsCompleted: 10, hoursCompleted: 50 },
    CHAMPION: { eventsCompleted: 25, hoursCompleted: 100 },
    LEGEND: { eventsCompleted: 50, hoursCompleted: 250 },
};

export interface BadgeProgress {
    current: number;
    target: number;
}

export class BadgeEvaluatorService {
    /**
     * Trả về danh sách badge đã đạt được
     */
    evaluateBadges(eventsCompleted: number, hoursCompleted: number): string[] {
        const earnedBadges: string[] = [];

        for (const [badgeName, requirements] of Object.entries(BADGE_REQUIREMENTS)) {
            const hasEvents = eventsCompleted >= requirements.eventsCompleted;
            const hasHours = !requirements.hoursCompleted || hoursCompleted >= requirements.hoursCompleted;

            if (hasEvents && hasHours) {
                earnedBadges.push(badgeName);
            }
        }

        return earnedBadges;
    }

    /**
     * Lấy badge tiếp theo cần đạt
     */
    getNextBadge(eventsCompleted: number, hoursCompleted: number): { badge: string; requirements: BadgeRequirement } | null {
        for (const [badgeName, requirements] of Object.entries(BADGE_REQUIREMENTS)) {
            const hasEvents = eventsCompleted >= requirements.eventsCompleted;
            const hasHours = !requirements.hoursCompleted || hoursCompleted >= requirements.hoursCompleted;

            if (!hasEvents || !hasHours) {
                return { badge: badgeName, requirements };
            }
        }
        return null; // đã đạt tất cả badge
    }

    /**
     * Tính tiến độ badge hiện tại (%)
     */
    calculateProgress(eventsCompleted: number, hoursCompleted: number): BadgeProgress | undefined {
        const nextBadge = this.getNextBadge(eventsCompleted, hoursCompleted);
        if (!nextBadge) return undefined;

        const { requirements } = nextBadge;
        const eventProgress = eventsCompleted / requirements.eventsCompleted;
        const hourProgress = requirements.hoursCompleted ? hoursCompleted / requirements.hoursCompleted : 1;

        const overallProgress = Math.min(eventProgress, hourProgress);

        return {
            current: Math.round(overallProgress * 100),
            target: 100
        };
    }
}
