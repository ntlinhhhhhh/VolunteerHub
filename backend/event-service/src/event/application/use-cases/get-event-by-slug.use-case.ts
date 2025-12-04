import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { Event } from '../../domain/entities/event.entity';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';


@Injectable()
export class GetEventBySlugUseCase {
  constructor(
    @Inject(IEventRepository)
    private readonly eventRepository: IEventRepository,
    @Inject(CACHE_MANAGER) 
    private readonly cacheManager: Cache,
  ) {}

  async execute(slug: string): Promise<Event> {
    // Try to get from cache first
    const cacheKey = `event:slug:${slug}`;
    const cached = await this.cacheManager.get<Event>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Get from database
    const event = await this.eventRepository.findBySlug(slug);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, event, 300);

    return event;
  }
}