import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { Event } from '../../domain/entities/event.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class GetEventByIdUseCase {
    constructor(
        @Inject(IEventRepository)
        private readonly eventRepository: IEventRepository,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) { }

    async execute(eventId: string): Promise<Event> {
        const cacheKey = `event:${eventId}`;

        // 1. Check cache
        const cached = await this.cacheManager.get<Event>(cacheKey);
        if (cached) return cached;

        // 2. Get from DB
        const event = await this.eventRepository.findById(eventId);
        if (!event) throw new NotFoundException('Event not found');

        // 3. Save cache for 5 minutes
        await this.cacheManager.set(cacheKey, event, 300);

        return event;
    }
}
