import { ActivityType } from './recent-activity.entity';

export enum UserRole {
    VOLUNTEER = 'VOLUNTEER',
    EVENT_MANAGER = 'EVENT_MANAGER',
    ADMIN = 'ADMIN'
}

export enum MetricPeriod {
    TODAY = 'TODAY',
    THIS_WEEK = 'THIS_WEEK',
    THIS_MONTH = 'THIS_MONTH',
    THIS_YEAR = 'THIS_YEAR',
    ALL_TIME = 'ALL_TIME'
}