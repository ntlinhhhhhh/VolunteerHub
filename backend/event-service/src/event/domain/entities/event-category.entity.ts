export class EventCategory {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly slug: string,
        public readonly description: string,
        public readonly icon: string,
        public readonly color: string,
        public readonly parentId: string | null,
        public readonly order: number,
        public readonly isActive: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }
}

export const DEFAULT_CATEGORIES = [
    {
        name: 'Environment',
        slug: 'environment',
        description: 'Environmental protection, tree planting, cleanup activities',
        icon: '🌳',
        color: '#10B981',
    },
    {
        name: 'Education',
        slug: 'education',
        description: 'Teaching, student support, libraries',
        icon: '📚',
        color: '#3B82F6',
    },
    {
        name: 'Healthcare',
        slug: 'healthcare',
        description: 'Health care, blood donation, first aid',
        icon: '⚕️',
        color: '#EF4444',
    },
    {
        name: 'Elderly Care',
        slug: 'elderly-care',
        description: 'Supporting the elderly, home visits',
        icon: '👴',
        color: '#F59E0B',
    },
    {
        name: 'Children',
        slug: 'children',
        description: 'Child care, orphan support',
        icon: '👶',
        color: '#EC4899',
    },
    {
        name: 'Community',
        slug: 'community',
        description: 'Community building, local events',
        icon: '🤝',
        color: '#8B5CF6',
    },
    {
        name: 'Animal Welfare',
        slug: 'animal-welfare',
        description: 'Animal protection, rescue activities',
        icon: '🐾',
        color: '#06B6D4',
    },
    {
        name: 'Emergency Relief',
        slug: 'emergency-relief',
        description: 'Disaster response, emergency assistance',
        icon: '🚨',
        color: '#DC2626',
    },
];
