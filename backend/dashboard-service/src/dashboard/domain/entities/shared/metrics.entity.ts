export enum MetricPeriod {
    TODAY = 'TODAY',
    THIS_WEEK = 'THIS_WEEK',
    THIS_MONTH = 'THIS_MONTH',
    THIS_YEAR = 'THIS_YEAR',
    ALL_TIME = 'ALL_TIME'
}

export interface MonthlyData {
    month: string;
    value: number;
    change?: number;
}

export interface TrendData {
    current: number;
    previous: number;
    change: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    sparkline: number[];
}

export interface ComparisonData {
    events: { current: number; previous: number; change: number };
    volunteers: { current: number; previous: number; change: number };
    hours: { current: number; previous: number; change: number };
    attendance: { current: number; previous: number; change: number };
}
