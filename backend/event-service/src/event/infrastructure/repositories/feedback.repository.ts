import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
    IFeedbackRepository,
    FeedbackFilterOptions,
    PaginatedResult,
} from '../../domain/repositories/feedback.repository.interface';
import { Feedback as FeedbackEntity, FeedbackType } from '../../domain/entities/feedback.entity';
import { Feedback as FeedbackSchema, FeedbackDocument } from '../database/schemas/feedback.schema';

@Injectable()
export class FeedbackRepository implements IFeedbackRepository {
    constructor(
        @InjectModel(FeedbackSchema.name)
        private readonly feedbackModel: Model<FeedbackDocument>
    ) { }

    private toEntity(doc: FeedbackDocument): FeedbackEntity {
        return new FeedbackEntity(
            doc._id.toString(),
            doc.eventId,
            doc.volunteerId!,
            doc.managerId ?? null,
            doc.feedbackType as FeedbackType,
            doc.rating,
            doc.createdAt,
            doc.updatedAt,
            doc.comment
        );
    }

    async findById(id: string): Promise<FeedbackEntity | null> {
        const doc = await this.feedbackModel.findById(id).exec();
        return doc ? this.toEntity(doc) : null;
    }

    async findAll(options: FeedbackFilterOptions): Promise<PaginatedResult<FeedbackEntity>> {
        const query: FilterQuery<FeedbackDocument> = {};

        if (options.eventId) {
            query.eventId = options.eventId;
        }

        if (options.volunteerId) {
            query.volunteerId = options.volunteerId;
        }

        if (options.managerId) {
            query.managerId = options.managerId;
        }

        if (options.feedbackType) {
            query.feedbackType = options.feedbackType;
        }

        if (options.rating) {
            query.rating = options.rating;
        }

        // Pagination
        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;

        // Sorting
        const sortField = options.sortBy || 'createdAt';
        const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
        const sort: any = { [sortField]: sortOrder };

        // Execute queries with population
        const [docs, total] = await Promise.all([
            this.feedbackModel.find(query).sort(sort).skip(skip).limit(limit)
                .populate('eventId', 'title organizerName organizerId') // Populate event data
                .exec(),
            this.feedbackModel.countDocuments(query).exec(),
        ]);

        return {
            data: docs.map(doc => this.toEntity(doc)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async create(feedback: any): Promise<FeedbackEntity> {
        const doc = new this.feedbackModel(feedback);
        const saved = await doc.save();
        return this.toEntity(saved);
    }

    async update(id: string, feedback: Partial<FeedbackEntity>): Promise<FeedbackEntity> {
        const doc = await this.feedbackModel
            .findByIdAndUpdate(id, { $set: feedback }, { new: true })
            .exec();

        if (!doc) {
            throw new Error('Feedback not found');
        }

        return this.toEntity(doc);
    }

    async delete(id: string): Promise<void> {
        await this.feedbackModel.findByIdAndDelete(id).exec();
    }

    async findByEventId(eventId: string, options?: FeedbackFilterOptions): Promise<PaginatedResult<FeedbackEntity>> {
        return this.findAll({
            ...options,
            eventId,
        });
    }

    async findByVolunteerId(volunteerId: string, options?: FeedbackFilterOptions): Promise<PaginatedResult<FeedbackEntity>> {
        return this.findAll({
            ...options,
            volunteerId,
        });
    }

    async findByManagerId(managerId: string, options?: FeedbackFilterOptions): Promise<PaginatedResult<FeedbackEntity>> {
        return this.findAll({
            ...options,
            managerId,
        });
    }

    async findByEventAndVolunteer(eventId: string, volunteerId: string): Promise<FeedbackEntity | null> {
        const doc = await this.feedbackModel.findOne({ eventId, volunteerId }).exec();
        return doc ? this.toEntity(doc) : null;
    }

    async getAverageRatingForEvent(eventId: string): Promise<number | null> {
        const result = await this.feedbackModel
            .aggregate([
                { $match: { eventId } },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                    },
                },
            ])
            .exec();

        return result.length > 0 ? result[0].averageRating : null;
    }

    async getFeedbackCountForEvent(eventId: string): Promise<number> {
        return await this.feedbackModel.countDocuments({ eventId }).exec();
    }

    async getFeedbackCountForVolunteer(volunteerId: string): Promise<number> {
        return await this.feedbackModel.countDocuments({ volunteerId }).exec();
    }

    // Custom method for enriched feedback data
    async findAllWithEventData(options: FeedbackFilterOptions): Promise<PaginatedResult<any>> {
        const query: FilterQuery<FeedbackDocument> = {};

        if (options.eventId) {
            query.eventId = options.eventId;
        }

        if (options.volunteerId) {
            query.volunteerId = options.volunteerId;
        }

        if (options.managerId) {
            query.managerId = options.managerId;
        }

        if (options.feedbackType) {
            query.feedbackType = options.feedbackType;
        }

        if (options.rating) {
            query.rating = options.rating;
        }

        // Pagination
        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;

        // Sorting
        const sortField = options.sortBy || 'createdAt';
        const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
        const sort: any = { [sortField]: sortOrder };

        // Execute queries with population
        const [docs, total] = await Promise.all([
            this.feedbackModel.find(query).sort(sort).skip(skip).limit(limit)
                .populate('eventId', 'title organizerName organizerId')
                .exec(),
            this.feedbackModel.countDocuments(query).exec(),
        ]);

        // Convert to plain objects with populated data
        const data = docs.map(doc => ({
            id: doc._id.toString(),
            eventId: doc.eventId,
            volunteerId: doc.volunteerId,
            managerId: doc.managerId,
            feedbackType: doc.feedbackType,
            rating: doc.rating,
            comment: doc.comment,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }));

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}