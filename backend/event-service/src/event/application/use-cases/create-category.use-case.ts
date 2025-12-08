import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import slugify from 'slugify';
import { IEventCategoryRepository } from 'src/event/domain/repositories/event-category.repository.interface';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { EventCategory } from 'src/event/domain/entities/event-category.entity';

@Injectable()
export class CreateCategoryUseCase {
    constructor(
        @Inject(IEventCategoryRepository)
        private readonly categoryRepository: IEventCategoryRepository
    ) { }

    async execute(dto: CreateCategoryDto): Promise<EventCategory> {
        // Validate parent category if provided
        if (dto.parentId) {
            const parentExists = await this.categoryRepository.exists(dto.parentId);
            if (!parentExists) {
                throw new BadRequestException('Parent category not found');
            }
        }

        // Generate slug
        const slug = await this.generateUniqueSlug(dto.name);

        const categoryData = {
            name: dto.name,
            slug,
            description: dto.description,
            icon: dto.icon,
            color: dto.color,
            parentId: dto.parentId || null,
            order: dto.order || 0,
            isActive: dto.isActive !== undefined ? dto.isActive : true,
        };

        return await this.categoryRepository.create(categoryData as any);
    }

    private async generateUniqueSlug(name: string): Promise<string> {
        let slug = slugify(name, { lower: true, strict: true });
        let counter = 1;
        let uniqueSlug = slug;

        while (await this.categoryRepository.findBySlug(uniqueSlug)) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        return uniqueSlug;
    }
}