import { Injectable, Inject } from '@nestjs/common';
import { IEventRepository, PaginatedResult } from '../../domain/repositories/event.repository.interface';
import { Event } from '../../domain/entities/event.entity';
import { FilterEventDto } from '../dto/filter-event.dto';

@Injectable()
export class ListEventsUseCase {
    constructor(
        @Inject(IEventRepository)
        private readonly eventRepository: IEventRepository
    ) { }

    async execute(filterDto: FilterEventDto): Promise<PaginatedResult<Event>> {
        const options = {
            status: filterDto.status,
            categoryId: filterDto.categoryId,
            organizerId: filterDto.organizerId,
            city: filterDto.city,
            district: filterDto.district,
            featured: filterDto.featured,
            visibility: filterDto.visibility,
            search: filterDto.search,
            startDateFrom: filterDto.startDateFrom ? new Date(filterDto.startDateFrom) : undefined,
            startDateTo: filterDto.startDateTo ? new Date(filterDto.startDateTo) : undefined,
            tags: filterDto.tags,
            page: filterDto.page || 1,
            limit: filterDto.limit || 20,
            sortBy: filterDto.sortBy || 'createdAt',
            sortOrder: filterDto.sortOrder || 'desc',
        };

        return await this.eventRepository.findAll(options);
    }
}