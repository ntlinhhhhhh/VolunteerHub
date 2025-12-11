import { AdminDashboard } from "src/dashboard/domain/entities/admin-dashboard.entity";
import { EventManagerDashboard } from "src/dashboard/domain/entities/event-manager-dashboard.entity";
import { MetricPeriod, UserRole } from "src/dashboard/domain/entities/use-role.enum";
import { VolunteerDashboard } from "src/dashboard/domain/entities/volunteer-dashboard.entity";

export interface IDashboardUseCases {
    // Get dashboards by role
    getVolunteerDashboard(userId: string, period: MetricPeriod): Promise<VolunteerDashboard>;
    getEventManagerDashboard(userId: string, period: MetricPeriod): Promise<EventManagerDashboard>;
    getAdminDashboard(userId: string, period: MetricPeriod): Promise<AdminDashboard>;

    // Refresh & cache
    refreshDashboard(userId: string, role: UserRole): Promise<void>;

    // Export functionality
    exportDashboardData(userId: string, role: UserRole, format: 'PDF' | 'EXCEL' | 'CSV'): Promise<Buffer>;

    // Real-time updates
    subscribeToUpdates(userId: string, role: UserRole): AsyncIterator<DashboardUpdate>;
}

export interface DashboardUpdate {
    type: 'METRICS_UPDATED' | 'NEW_ACTIVITY' | 'NEW_NOTIFICATION' | 'ALERT';
    data: any;
    timestamp: Date;
}
