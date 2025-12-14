export interface UserSummary {
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
}