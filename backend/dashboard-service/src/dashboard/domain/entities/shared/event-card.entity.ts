export interface EventCard {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    category: string;
    tags: string[];
    status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

    managerId: string;
    managerName: string;
    managerAvatar?: string;

    volunteersNeeded: number;
    volunteersRegistered: number;
    volunteersAttended: number;
    registrationRate: number;
    attendanceRate: number;

    averageRating?: number;
    totalReviews?: number;
    coverImage?: string;

    myStatus?: 'NOT_REGISTERED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    myCheckIn?: Date;
    myCheckOut?: Date;
    myHoursWorked?: number;
    recommendationScore?: number;
}