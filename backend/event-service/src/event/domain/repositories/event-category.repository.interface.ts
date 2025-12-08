import { EventCategory } from '../entities/event-category.entity';

export interface IEventCategoryRepository {
    findById(id: string): Promise<EventCategory | null>;
    findBySlug(slug: string): Promise<EventCategory | null>;
    findAll(activeOnly?: boolean): Promise<EventCategory[]>;
    findByParentId(parentId: string | null): Promise<EventCategory[]>;
    create(category: Omit<EventCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventCategory>;
    update(id: string, category: Partial<EventCategory>): Promise<EventCategory>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
    seedDefaultCategories(): Promise<void>;
}

export const IEventCategoryRepository = Symbol('IEventCategoryRepository');