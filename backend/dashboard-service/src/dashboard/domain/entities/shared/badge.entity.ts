export interface Badge {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    earnedAt: Date;
    progress?: {
        current: number;
        target: number;
    };
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    category: 'HOURS' | 'EVENTS' | 'STREAK' | 'IMPACT' | 'SPECIAL';
    completedAt: Date;
    reward?: {
        points: number;
        badge?: string;
    };
}