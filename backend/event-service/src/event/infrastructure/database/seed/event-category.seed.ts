import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { EventCategory } from '../schemas/event-category.schema';
import { DEFAULT_CATEGORIES } from 'src/event/domain/entities/event-category.entity';

@Injectable()
export class EventCategorySeeder {
  private readonly logger = new Logger(EventCategorySeeder.name);

  constructor(
    @InjectModel('EventCategory')
    private readonly categoryModel: Model<EventCategory>,
  ) {}

  async seed() {
    for (const [index, category] of DEFAULT_CATEGORIES.entries()) {
      const exists = await this.categoryModel.findOne({ slug: category.slug });
      if (exists) {
        this.logger.log(`Category "${category.name}" already exists. Skipping.`);
        continue;
      }

      const newCategory = new this.categoryModel({
        id: uuidv4(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color,
        parentId: null,
        order: index + 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newCategory.save();
      this.logger.log(`Category "${category.name}" created.`);
    }

    this.logger.log('Event categories seeding completed.');
  }
}
