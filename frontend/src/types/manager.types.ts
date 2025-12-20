export interface Registration {
    id: string;
    registrationCode: string;
    eventTitle: string;
    volunteerName: string;
    volunteerEmail: string;
    volunteerPhone: string;
    roleName: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    applicationForm: {
        motivation: string;
        experience: string;
        skills: string[];
        availability: string;
        emergencyContact: { name: string; phone: string; relationship: string; };
    };
    createdAt: string;
}

export interface UserData {
    id: string;
    authId: string;
    username: string;
    email: string;
    avatar: string | null;
}