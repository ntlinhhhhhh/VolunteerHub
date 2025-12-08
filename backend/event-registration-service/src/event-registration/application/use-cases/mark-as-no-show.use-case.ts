// import {
//     Injectable,
//     Inject,
//     NotFoundException,
//     ForbiddenException,
//     BadRequestException,
//     Logger,
// } from '@nestjs/common';
// import { IRegistrationRepository } from '../../domain/repositories/registration.repository.interface';
// import { Registration } from '../../domain/entities/registration.entity';
// import { RegistrationStatus } from '../../domain/entities/registration-status.enum';

// /**
//  * USE CASE #9: Đánh dấu volunteer không đến (no-show)
//  * Organizer đánh dấu khi event kết thúc mà volunteer không check-in
//  */
// @Injectable()
// export class MarkAsNoShowUseCase {
//     private readonly logger = new Logger(MarkAsNoShowUseCase.name);

//     constructor(
//         @Inject(IRegistrationRepository)
//         private readonly registrationRepository: IRegistrationRepository,
//         private readonly messageBusService: MessageBusService
//     ) { }

//     async execute(registrationId: string, organizerId: string): Promise<Registration> {
//         const registration = await this.registrationRepository.findById(registrationId);
//         if (!registration) {
//             throw new NotFoundException('Registration not found');
//         }

//         if (registration.organizerId !== organizerId) {
//             throw new ForbiddenException('You can only mark no-show for your events');
//         }

//         // Only mark no-show for ACCEPTED or CONFIRMED registrations
//         if (![RegistrationStatus.ACCEPTED, RegistrationStatus.CONFIRMED].includes(registration.status)) {
//             throw new BadRequestException(
//                 `Cannot mark as no-show with status: ${registration.status}`
//             );
//         }

//         // Check event has passed
//         const now = new Date();
//         if (now < registration.eventDate) {
//             throw new BadRequestException('Cannot mark as no-show before event date');
//         }

//         await this.registrationRepository.updateStatus(registrationId, RegistrationStatus.NO_SHOW);

//         // Notify EVENT SERVICE to decrement volunteer count
//         await this.messageBusService.publish('registration.no_show', {
//             registrationId: registration.id,
//             eventId: registration.eventId,
//             volunteerId: registration.volunteerId,
//             volunteerName: registration.volunteerName,
//             volunteerEmail: registration.volunteerEmail,
//         });

//         this.logger.log(`Registration marked as no-show: ${registrationId}`);

//         const updated = await this.registrationRepository.findById(registrationId);
//         return updated!;
//     }
// }