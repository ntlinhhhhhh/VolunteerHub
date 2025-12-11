import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IEventRepository } from "src/event/domain/repositories/event.repository.interface";
import { EventRepository } from "src/event/infrastructure/repositories/event.repository";

@Injectable()
export class IncrementRoleFilledUseCase {
    constructor(
        private readonly eventRepository: EventRepository,
    ) {}

    async execute(eventId: string, roleId: string): Promise<void> {
        console.log('called-increment');
        const event = await this.eventRepository.findById(eventId);
        if (!event) throw new NotFoundException('Event not found');

        const role = event.roles.find(r => r.id === roleId);
        if (!role) throw new NotFoundException('Role not found');

        if (role.filled >= role.slots) {
            throw new BadRequestException('Role is already full');
        }

        role.filled += 1;
        event.capacity.currentVolunteers += 1;
        await this.eventRepository.update(eventId, { roles: event.roles, capacity: event.capacity });
    }
}
