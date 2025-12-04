import { Injectable, Inject } from '@nestjs/common';
import { EventCategory } from 'src/event/domain/entities/event-category.entity';
import { IEventCategoryRepository } from 'src/event/domain/repositories/event-category.repository.interface';

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(IEventCategoryRepository)
    private readonly categoryRepository: IEventCategoryRepository
  ) {}

  async execute(activeOnly: boolean = true): Promise<EventCategory[]> {
    return await this.categoryRepository.findAll(activeOnly);
  }
}