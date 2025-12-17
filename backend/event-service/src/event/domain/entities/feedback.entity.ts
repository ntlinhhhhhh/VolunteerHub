export enum FeedbackType {
    MANAGER_TO_VOLUNTEER = 'manager_to_volunteer',
    VOLUNTEER_TO_EVENT = 'volunteer_to_event',
}

export class Feedback {
    constructor(
        public readonly id: string,
        public readonly eventId: string,
        public readonly volunteerId: string,
        public readonly managerId: string | null, // null for volunteer-to-event feedback
        public readonly feedbackType: FeedbackType,
        public readonly rating: number, // 1-5 stars
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly comment?: string
    ) {}

    // Business logic methods
    isValidRating(): boolean {
        return this.rating >= 1 && this.rating <= 5;
    }

    // Update methods (return new instance - immutable)
    updateComment(newComment: string): Feedback {
        return new Feedback(
            this.id,
            this.eventId,
            this.volunteerId,
            this.managerId,
            this.feedbackType,
            this.rating,
            this.createdAt,
            new Date(),
            newComment
        );
    }

    updateRating(newRating: number): Feedback {
        if (newRating < 1 || newRating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        return new Feedback(
            this.id,
            this.eventId,
            this.volunteerId,
            this.managerId,
            this.feedbackType,
            newRating,
            this.createdAt,
            new Date(),
            this.comment
        );
    }
}