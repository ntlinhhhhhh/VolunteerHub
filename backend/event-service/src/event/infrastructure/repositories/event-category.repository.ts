import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IEventCategoryRepository } from '../../domain/repositories/event-category.repository.interface';
import { EventCategory as EventCategoryEntity, DEFAULT_CATEGORIES } from '../../domain/entities/event-category.entity';
import { EventCategory as EventCategorySchema, EventCategoryDocument } from '../database/schemas/event-category.schema';

@Injectable()
export class EventCategoryRepository implements IEventCategoryRepository {
  constructor(
    @InjectModel(EventCategorySchema.name)
    private readonly categoryModel: Model<EventCategoryDocument>
  ) {}

  private toEntity(doc: EventCategoryDocument): EventCategoryEntity {
    return new EventCategoryEntity(
      doc._id.toString(),
      doc.name,
      doc.slug,
      doc.description,
      doc.icon,
      doc.color,
      doc.parentId,
      doc.order,
      doc.isActive,
      doc.createdAt,
      doc.updatedAt
    );
  }

  async findById(id: string): Promise<EventCategoryEntity | null> {
    const doc = await this.categoryModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findBySlug(slug: string): Promise<EventCategoryEntity | null> {
    const doc = await this.categoryModel.findOne({ slug }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(activeOnly: boolean = true): Promise<EventCategoryEntity[]> {
    const query = activeOnly ? { isActive: true } : {};
    const docs = await this.categoryModel.find(query).sort({ order: 1, name: 1 }).exec();
    return docs.map(doc => this.toEntity(doc));
  }

  async findByParentId(parentId: string | null): Promise<EventCategoryEntity[]> {
    const docs = await this.categoryModel
      .find({ parentId, isActive: true })
      .sort({ order: 1 })
      .exec();
    return docs.map(doc => this.toEntity(doc));
  }

  async create(category: any): Promise<EventCategoryEntity> {
    const doc = new this.categoryModel(category);
    const saved = await doc.save();
    return this.toEntity(saved);
  }

  async update(id: string, category: Partial<EventCategoryEntity>): Promise<EventCategoryEntity> {
    const doc = await this.categoryModel
      .findByIdAndUpdate(id, { $set: category }, { new: true })
      .exec();

    if (!doc) {
      throw new Error('Category not found');
    }

    return this.toEntity(doc);
  }

  async delete(id: string): Promise<void> {
    await this.categoryModel.findByIdAndDelete(id).exec();
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.categoryModel.countDocuments({ _id: id }).exec();
    return count > 0;
  }

  async seedDefaultCategories(): Promise<void> {
    const count = await this.categoryModel.countDocuments().exec();
    
    if (count === 0) {
      const categories = DEFAULT_CATEGORIES.map((cat, index) => ({
        ...cat,
        parentId: null,
        order: index,
        isActive: true,
      }));

      await this.categoryModel.insertMany(categories);
      console.log('✅ Default categories seeded');
    }
  }
}