import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
    IEventRepository,
    EventFilterOptions,
    PaginatedResult,
} from '../../domain/repositories/event.repository.interface';
import { Event as EventEntity } from '../../domain/entities/event.entity';
import { Event as EventSchema, EventDocument } from '../database/schemas/event.schema';
import { EventStatus } from '../../domain/entities/event-status.enum';

@Injectable()
export class EventRepository implements IEventRepository {
    constructor(
        @InjectModel(EventSchema.name)
        private readonly eventModel: Model<EventDocument>
    ) { }

    private toEntity(doc: EventDocument): EventEntity {
        return new EventEntity(
            doc._id.toString(),
            doc.title,
            doc.slug,
            doc.description,
            doc.organizerId,
            doc.organizerName,
            doc.organizerEmail,
            doc.organizerPhone,
            doc.categoryId,
            doc.categoryName,
            doc.location,
            doc.schedule,
            doc.requirements,
            doc.capacity,
            doc.roles,
            doc.status,
            doc.approval,
            doc.media,
            doc.visibility as 'public' | 'private',
            doc.featured,
            doc.tags,
            doc.createdAt,
            doc.updatedAt
        );
    }

    async findById(id: string): Promise<EventEntity | null> {
        const doc = await this.eventModel.findById(id).exec();
        return doc ? this.toEntity(doc) : null;
    }

    async findBySlug(slug: string): Promise<EventEntity | null> {
        const doc = await this.eventModel.findOne({ slug }).exec();
        return doc ? this.toEntity(doc) : null;
    }

    async findAll(options: EventFilterOptions): Promise<PaginatedResult<EventEntity>> {
        const query: FilterQuery<EventDocument> = {};

        // Status filter
        if (options.status) {
            query.status = options.status;
        }

        // Category filter
        if (options.categoryId) {
            query.categoryId = options.categoryId;
        }

        // Organizer filter
        if (options.organizerId) {
            query.organizerId = options.organizerId;
        }

        // Location filters
        if (options.city) {
            query['location.city'] = options.city;
        }
        if (options.district) {
            query['location.district'] = options.district;
        }

        // Featured filter
        if (options.featured !== undefined) {
            query.featured = options.featured;
        }

        // Visibility filter
        if (options.visibility) {
            query.visibility = options.visibility;
        }

        // Date range filters
        if (options.startDateFrom || options.startDateTo) {
            query['schedule.startDate'] = {};
            if (options.startDateFrom) {
                query['schedule.startDate'].$gte = options.startDateFrom;
            }
            if (options.startDateTo) {
                query['schedule.startDate'].$lte = options.startDateTo;
            }
        }

        // Tags filter
        if (options.tags && options.tags.length > 0) {
            query.tags = { $in: options.tags };
        }

        // Search filter (full-text search)
        if (options.search) {
            query.$text = { $search: options.search };
        }

        // Pagination
        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;

        // Sorting
        const sortField = options.sortBy || 'createdAt';
        const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
        const sort: any = { [sortField]: sortOrder };

        // Execute queries
        const [docs, total] = await Promise.all([
            this.eventModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
            this.eventModel.countDocuments(query).exec(),
        ]);

        return {
            data: docs.map(doc => this.toEntity(doc)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async create(event: any): Promise<EventEntity> {
        const doc = new this.eventModel(event);
        const saved = await doc.save();
        return this.toEntity(saved);
    }

    async update(id: string, event: Partial<EventEntity>): Promise<EventEntity> {
        const doc = await this.eventModel
            .findByIdAndUpdate(id, { $set: event }, { new: true })
            .exec();

        if (!doc) {
            throw new Error('Event not found');
        }

        return this.toEntity(doc);
    }

    async delete(id: string): Promise<void> {
        await this.eventModel.findByIdAndDelete(id).exec();
    }

    async findByStatus(status: EventStatus, limit?: number): Promise<EventEntity[]> {
        const query = this.eventModel.find({ status }).sort({ createdAt: -1 });

        if (limit) {
            query.limit(limit);
        }

        const docs = await query.exec();
        return docs.map(doc => this.toEntity(doc));
    }

    async findByOrganizer(
        organizerId: string,
        options?: EventFilterOptions
    ): Promise<PaginatedResult<EventEntity>> {
        return this.findAll({
            ...options,
            organizerId,
        });
    }

    async findPendingApproval(): Promise<EventEntity[]> {
        return this.findByStatus(EventStatus.PENDING_APPROVAL);
    }

    async findPublished(options: EventFilterOptions): Promise<PaginatedResult<EventEntity>> {
        return this.findAll({
            ...options,
            status: EventStatus.PUBLISHED,
            visibility: 'public',
        });
    }

    async findFeatured(limit: number = 10): Promise<EventEntity[]> {
        const docs = await this.eventModel
            .find({
                featured: true,
                status: EventStatus.PUBLISHED,
                visibility: 'public',
            })
            .sort({ 'schedule.startDate': 1 })
            .limit(limit)
            .exec();

        return docs.map(doc => this.toEntity(doc));
    }

    async updateStatus(id: string, status: EventStatus): Promise<void> {
        await this.eventModel.updateOne({ _id: id }, { $set: { status } }).exec();
    }

    async incrementVolunteerCount(id: string): Promise<void> {
        await this.eventModel
            .updateOne({ _id: id }, { $inc: { 'capacity.currentVolunteers': 1 } })
            .exec();
    }

    async decrementVolunteerCount(id: string): Promise<void> {
        await this.eventModel
            .updateOne(
                { _id: id },
                {
                    $inc: { 'capacity.currentVolunteers': -1 },
                    $max: { 'capacity.currentVolunteers': 0 }, // Ensure it doesn't go below 0
                }
            )
            .exec();
    }

    async updateOrganizerInfo(
        organizerId: string,
        organizerData: Partial<{
            organizerName: string;
            organizerEmail: string;
            organizerPhone: string;
        }>
    ): Promise<void> {
        await this.eventModel
            .updateMany({ organizerId }, { $set: organizerData })
            .exec();
    }

    async countByStatus(status: EventStatus): Promise<number> {
        return await this.eventModel.countDocuments({ status }).exec();
    }

    async countByOrganizer(organizerId: string): Promise<number> {
        return await this.eventModel.countDocuments({ organizerId }).exec();
    }

    async getUpcomingEvents(limit: number = 10): Promise<EventEntity[]> {
        const now = new Date();
        const docs = await this.eventModel
            .find({
                status: EventStatus.PUBLISHED,
                'schedule.startDate': { $gte: now },
            })
            .sort({ 'schedule.startDate': 1 })
            .limit(limit)
            .exec();

        return docs.map(doc => this.toEntity(doc));
    }

    async getPopularCategories(): Promise<Array<{ categoryId: string; categoryName: string; count: number }>> {
        const results = await this.eventModel
            .aggregate([
                {
                    $match: {
                        status: { $in: [EventStatus.PUBLISHED, EventStatus.ONGOING, EventStatus.COMPLETED] },
                    },
                },
                {
                    $group: {
                        _id: '$categoryId',
                        categoryName: { $first: '$categoryName' },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { count: -1 },
                },
                {
                    $limit: 10,
                },
            ])
            .exec();

        return results.map(r => ({
            categoryId: r._id,
            categoryName: r.categoryName,
            count: r.count,
        }));
    }
}