import { TrendData } from '../entities/shared/metrics.entity';

export class TrendAnalysisService {
    analyzeTrend(sparkline: number[]): 'UP' | 'DOWN' | 'STABLE' {
        if (sparkline.length < 2) return 'STABLE';
        const current = sparkline[sparkline.length - 1];
        const previous = sparkline[sparkline.length - 2];
        const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
        if (change > 5) return 'UP';
        if (change < -5) return 'DOWN';
        return 'STABLE';
    }

    calculateTrendData(sparkline: number[]): TrendData {
        const current = sparkline[sparkline.length - 1] || 0;
        const previous = sparkline[sparkline.length - 2] || 0;
        const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

        return {
            current,
            previous,
            change,
            trend: this.analyzeTrend(sparkline),
            sparkline
        };
    }

    predictNextValue(data: number[]): number {
        if (data.length < 2) return data[0] || 0;

        // Simple linear regression
        const n = data.length;
        const sumX = (n * (n + 1)) / 2;
        const sumY = data.reduce((a, b) => a + b, 0);
        const sumXY = data.reduce((sum, y, x) => sum + (x + 1) * y, 0);
        const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return Math.round(slope * (n + 1) + intercept);
    }
}
