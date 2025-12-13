// import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
// import { IEventRepository } from '../../domain/repositories/event.repository.interface';
// import { IEventCategoryRepository } from '../../domain/repositories/event-category.repository.interface';
// import { CreateEventDto } from '../dto/create-event.dto';
// import { Event } from '../../domain/entities/event.entity';
// import { EventStatus } from '../../domain/entities/event-status.enum';
// import slugify from 'slugify';
// import { v4 as uuidv4 } from 'uuid';

// interface CreateEventParams {
//     dto: CreateEventDto;
//     organizerId: string;
//     organizerName: string;
//     organizerEmail: string;
//     organizerPhone: string;
// }

// @Injectable()
// export class CreateEventUseCase {
//     private readonly logger = new Logger(CreateEventUseCase.name);

//     constructor(
//         @Inject(IEventRepository)
//         private readonly eventRepository: IEventRepository,
//         @Inject(IEventCategoryRepository)
//         private readonly categoryRepository: IEventCategoryRepository
//     ) { }

//     async execute(params: CreateEventParams): Promise<Event> {
//         const { dto, organizerId, organizerName, organizerEmail, organizerPhone } = params;

//         // 1. Validate category exists
//         const category = await this.categoryRepository.findById(dto.categoryId);
//         if (!category) {
//             throw new BadRequestException('Category not found');
//         }

//         if (!category.isActive) {
//             throw new BadRequestException('Category is not active');
//         }

//         // 2. Validate dates
//         this.validateDates(dto.schedule);

//         // 3. Validate capacity
//         if (dto.capacity.minVolunteers > dto.capacity.maxVolunteers) {
//             throw new BadRequestException('minVolunteers cannot exceed maxVolunteers');
//         }

//         // 4. Validate roles slots
//         const totalSlots = dto.roles.reduce((sum, role) => sum + role.slots, 0);
//         if (totalSlots > dto.capacity.maxVolunteers) {
//             throw new BadRequestException('Total role slots cannot exceed maxVolunteers');
//         }

//         // 5. Generate slug
//         const slug = await this.generateUniqueSlug(dto.title);

//         // 6. Create event entity
//         const eventData = {
//             title: dto.title,
//             slug,
//             description: dto.description,
//             organizerId,
//             organizerName,
//             organizerEmail,
//             organizerPhone,
//             categoryId: dto.categoryId,
//             categoryName: category.name,
//             location: dto.location,
//             schedule: {
//                 startDate: new Date(dto.schedule.startDate),
//                 endDate: new Date(dto.schedule.endDate),
//                 registrationDeadline: new Date(dto.schedule.registrationDeadline),
//             },
//             requirements: dto.requirements,
//             capacity: {
//                 ...dto.capacity,
//                 currentVolunteers: 0,
//             },
//             roles: dto.roles.map(role => ({
//                 id: uuidv4(),
//                 name: role.name,
//                 description: role.description,
//                 slots: role.slots,
//                 filled: 0,
//             })),
//             status: EventStatus.DRAFT,
//             approval: {},
//             media: {
//                 images: dto.images?.length ? dto.images : ['/uploads/events/default.png'],
//                 videos: dto.videos || [],
//                 documents: [],
//             },
//             visibility: dto.visibility || 'public',
//             featured: false,
//             tags: dto.tags || [],
//         };

//         // 7. Save to database
//         const event = await this.eventRepository.create(eventData as any);

//         this.logger.log(`Event created: ${event.id} by organizer: ${organizerId}`);

//         return event;
//     }

//     private validateDates(schedule: { startDate: Date; endDate: Date; registrationDeadline: Date }): void {
//         const now = new Date();
//         const start = new Date(schedule.startDate);
//         const end = new Date(schedule.endDate);
//         const deadline = new Date(schedule.registrationDeadline);

//         if (start < now) {
//             throw new BadRequestException('Start date must be in the future');
//         }

//         if (end <= start) {
//             throw new BadRequestException('End date must be after start date');
//         }

//         if (deadline >= start) {
//             throw new BadRequestException('Registration deadline must be before start date');
//         }

//         if (deadline < now) {
//             throw new BadRequestException('Registration deadline must be in the future');
//         }
//     }

//     private async generateUniqueSlug(title: string): Promise<string> {
//         let slug = slugify(title, { lower: true, strict: true });
//         let counter = 1;
//         let uniqueSlug = slug;

//         while (await this.eventRepository.findBySlug(uniqueSlug)) {
//             uniqueSlug = `${slug}-${counter}`;
//             counter++;
//         }

//         return uniqueSlug;
//     }
// }

import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { IEventCategoryRepository } from '../../domain/repositories/event-category.repository.interface';
import { CreateEventDto } from '../dto/create-event.dto';
import { Event } from '../../domain/entities/event.entity';
import { EventStatus } from '../../domain/entities/event-status.enum';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

interface CreateEventParams {
    dto: CreateEventDto;
    organizerId: string;
    organizerName: string;
    organizerEmail: string;
    organizerPhone: string;
}

@Injectable()
export class CreateEventUseCase {
    private readonly logger = new Logger(CreateEventUseCase.name);

    constructor(
        @Inject(IEventRepository)
        private readonly eventRepository: IEventRepository,
        @Inject(IEventCategoryRepository)
        private readonly categoryRepository: IEventCategoryRepository,
    ) {}

    async execute(params: CreateEventParams): Promise<Event> {
        const { dto, organizerId, organizerName, organizerEmail, organizerPhone } = params;

        // 1. Validate category
        const category = await this.categoryRepository.findById(dto.categoryId);
        if (!category) throw new BadRequestException('Category not found');
        if (!category.isActive) throw new BadRequestException('Category is not active');

        // 2. Validate dates
        this.validateDates(dto.schedule);

        // 3. Validate capacity
        if (dto.capacity.minVolunteers > dto.capacity.maxVolunteers) {
            throw new BadRequestException('minVolunteers cannot exceed maxVolunteers');
        }

        // 4. Validate roles
        const totalSlots = dto.roles.reduce((sum, r) => sum + r.slots, 0);
        if (totalSlots > dto.capacity.maxVolunteers) {
            throw new BadRequestException('Total role slots cannot exceed maxVolunteers');
        }

        // 5. Unique slug
        const slug = await this.generateUniqueSlug(dto.title);

        // 6. Create event object
        const eventData = {
            title: dto.title,
            slug,
            description: dto.description,

            organizerId,
            organizerName,
            organizerEmail,
            organizerPhone,

            categoryId: dto.categoryId,
            categoryName: category.name,

            location: dto.location,

            schedule: {
                startDate: new Date(dto.schedule.startDate),
                endDate: new Date(dto.schedule.endDate),
                registrationDeadline: new Date(dto.schedule.registrationDeadline),
            },

            requirements: dto.requirements,

            capacity: {
                ...dto.capacity,
                currentVolunteers: 0,
            },

            roles: dto.roles.map((role) => ({
                id: uuidv4(),
                name: role.name,
                description: role.description,
                slots: role.slots,
                filled: 0,
            })),

            status: EventStatus.DRAFT,
            media: {
                images: dto.images?.length ? dto.images : ['/uploads/events/default.png'],
                videos: dto.videos || [],
                documents: [],
            },

            visibility: dto.visibility || 'public',
            featured: false,
            tags: dto.tags || [],
        };

        const event = await this.eventRepository.create(eventData as any);

        this.logger.log(`Event created: ${event.id} by ${organizerId}`);

        return event;
    }

    private validateDates(schedule: any) {
        const now = new Date();
        const start = new Date(schedule.startDate);
        const end = new Date(schedule.endDate);
        const deadline = new Date(schedule.registrationDeadline);

        if (start < now) throw new BadRequestException('Start date must be in the future');
        if (end <= start) throw new BadRequestException('End date must be after start date');
        if (deadline >= start) throw new BadRequestException('Deadline must be before start date');
        if (deadline < now) throw new BadRequestException('Deadline must be in the future');
    }

    private async generateUniqueSlug(title: string) {
        let slug = slugify(title, { lower: true, strict: true });
        let counter = 1;
        let uniqueSlug = slug;

        while (await this.eventRepository.findBySlug(uniqueSlug)) {
            uniqueSlug = `${slug}-${counter++}`;
        }

        return uniqueSlug;
    }
}
