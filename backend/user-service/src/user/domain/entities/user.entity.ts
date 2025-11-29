export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
}

export class User {
    constructor(
        public readonly id: string,
        public readonly authId: string,
        public readonly email: string,
        public readonly username: string,
        public readonly fullName: string,
        public readonly phoneNumber: string | null,
        public readonly avatar: string | null,
        public readonly address: string | null,
        public readonly bio: string | null,
        public readonly dateOfBirth: Date | null,
        public readonly status: UserStatus,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    isActive(): boolean {
        return this.status === UserStatus.ACTIVE;
    }

    isSuspended(): boolean {
        return this.status === UserStatus.SUSPENDED;
    }

    canParticipateInEvents(): boolean {
        return this.status === UserStatus.ACTIVE;
    }

    getAge(): number | null {
        if (!this.dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    isAdult(): boolean {
        const age = this.getAge();
        return age !== null && age >= 18;
    }

    toSafeObject() {
        return {
            id: this.id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            phoneNumber: this.phoneNumber,
            avatar: this.avatar,
            address: this.address,
            bio: this.bio,
            dateOfBirth: this.dateOfBirth,
            status: this.status,
            age: this.getAge(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}