
export enum RegistrationStatus {
    // Initial state
    PENDING = 'pending',                    // Waiting for organizer approval

    // Approved states
    ACCEPTED = 'accepted',                  // Organizer accepted
    CONFIRMED = 'confirmed',                // Volunteer confirmed attendance

    // Event day states
    CHECKED_IN = 'checked_in',              // Volunteer checked in
    CHECKED_OUT = 'checked_out',            // Volunteer checked out
    COMPLETED = 'completed',                // Event completed, certificate issued
    RATED = 'rated',                        // Volunteer rated the event

    // Rejection/Cancellation states
    REJECTED = 'rejected',                  // Organizer rejected
    CANCELLED_BY_VOLUNTEER = 'cancelled_by_volunteer',
    CANCELLED_BY_ORGANIZER = 'cancelled_by_organizer',
    NO_SHOW = 'no_show',                   // Didn't show up
}

export const REGISTRATION_STATUS_TRANSITIONS = {
    [RegistrationStatus.PENDING]: [
        RegistrationStatus.ACCEPTED,
        RegistrationStatus.REJECTED,
        RegistrationStatus.CANCELLED_BY_VOLUNTEER,
        RegistrationStatus.CANCELLED_BY_ORGANIZER,
    ],
    [RegistrationStatus.ACCEPTED]: [
        RegistrationStatus.CONFIRMED,
        RegistrationStatus.CHECKED_IN,
        RegistrationStatus.CANCELLED_BY_VOLUNTEER,
        RegistrationStatus.CANCELLED_BY_ORGANIZER,
        RegistrationStatus.NO_SHOW,
    ],
    [RegistrationStatus.CONFIRMED]: [
        RegistrationStatus.CHECKED_IN,
        RegistrationStatus.CANCELLED_BY_VOLUNTEER,
        RegistrationStatus.CANCELLED_BY_ORGANIZER,
        RegistrationStatus.NO_SHOW,
    ],
    [RegistrationStatus.CHECKED_IN]: [
        RegistrationStatus.CHECKED_OUT,
        RegistrationStatus.NO_SHOW,
    ],
    [RegistrationStatus.CHECKED_OUT]: [
        RegistrationStatus.COMPLETED,
    ],
    [RegistrationStatus.COMPLETED]: [
        RegistrationStatus.RATED,
    ],
    [RegistrationStatus.RATED]: [],
    [RegistrationStatus.REJECTED]: [],
    [RegistrationStatus.CANCELLED_BY_VOLUNTEER]: [],
    [RegistrationStatus.CANCELLED_BY_ORGANIZER]: [],
    [RegistrationStatus.NO_SHOW]: [],
};