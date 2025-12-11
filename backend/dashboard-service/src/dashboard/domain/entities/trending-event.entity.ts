export class TrendingEvent {
    constructor(
      public readonly id: string,
      public readonly eventId: string,
      public readonly eventName: string,
      public readonly eventDate: Date,
      public readonly eventLocation: string,
      public readonly registrationCount: number,
      public readonly lastActivityTimestamp: Date,
      public readonly trendScore: number, // Điểm trending (dựa vào registrations + activities)
      public readonly createdAt: Date,
      public readonly updatedAt: Date
    ) {}
  
    static calculateTrendScore(registrations: number, recentActivities: number): number {
      // Algorithm: (registrations * 2) + (recentActivities * 3)
      return registrations * 2 + recentActivities * 3;
    }
  }