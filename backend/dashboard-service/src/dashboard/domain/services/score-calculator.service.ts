export const VOLUNTEER_HOUR_VALUE = 31.8;

export const GAMIFICATION_LEVELS = [
    { level: 1, pointsRequired: 0 },
    { level: 2, pointsRequired: 100 },
    { level: 3, pointsRequired: 250 },
    { level: 4, pointsRequired: 500 },
    { level: 5, pointsRequired: 1000 },
    { level: 6, pointsRequired: 2000 },
    { level: 7, pointsRequired: 5000 },
    { level: 8, pointsRequired: 10000 },
];

export class ScoreCalculatorService {
    calculateLevel(points: number): number {
        for (let i = GAMIFICATION_LEVELS.length - 1; i >= 0; i--) {
            if (points >= GAMIFICATION_LEVELS[i].pointsRequired) {
                return GAMIFICATION_LEVELS[i].level;
            }
        }
        return 1;
    }

    getPointsToNextLevel(points: number): number {
        const currentLevel = this.calculateLevel(points);
        const nextLevel = GAMIFICATION_LEVELS.find(l => l.level === currentLevel + 1);
        return nextLevel ? nextLevel.pointsRequired - points : 0;
    }

    calculateMonetaryValue(hours: number): number {
        return hours * VOLUNTEER_HOUR_VALUE;
    }

    calculateCompletionRate(completed: number, total: number): number {
        return total > 0 ? (completed / total) * 100 : 0;
    }

    calculateAttendanceRate(attended: number, total: number): number {
        return total > 0 ? (attended / total) * 100 : 0;
    }

    calculateMatchScore(volunteerSkills: string[], eventRequirements: string[]): number {
        if (eventRequirements.length === 0) return 100;
        const matches = volunteerSkills.filter(skill => eventRequirements.includes(skill)).length;
        return Math.round((matches / eventRequirements.length) * 100);
    }

    calculateGrowthRate(current: number, previous: number): number {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }
}
