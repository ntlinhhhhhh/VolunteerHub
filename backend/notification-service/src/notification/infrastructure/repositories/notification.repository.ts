/**
 * GIẢI THÍCH:
 * Implement INotificationRepository với MongoDB.
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification as NotificationEntity } from '../../domain/entities/notification.entity';
import { NotificationStatus } from '../../domain/entities/notification-status.enum';
import { Notification, NotificationSchema } from '../database/schemas/notification.schema';

// Mongoose Document type
export type NotificationDocument = Notification & Document;

@Injectable()
export class NotificationRepository implements INotificationRepository {
    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<NotificationDocument>
    ) { }

    private toEntity(doc: NotificationDocument): NotificationEntity {
        return new NotificationEntity(
            doc._id.toString(),
            doc.userId,
            doc.type,
            doc.channel,      // NotificationChannel
            doc.channels,     // { inApp?: boolean, email?: string, push?: string }
            doc.status,       // NotificationStatus
            doc.subject,
            doc.content,
            doc.data,
            doc.sentAt,
            doc.readAt,
            doc.errorMessage,
            doc.retryCount,
            doc.createdAt,
            doc.updatedAt
        );
    }

    async findById(id: string): Promise<NotificationEntity | null> {
        const doc = await this.notificationModel.findById(id).exec();
        return doc ? this.toEntity(doc) : null;
    }

    async findByUserId(userId: string, limit: number = 20): Promise<NotificationEntity[]> {
        const docs = await this.notificationModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
        return docs.map(doc => this.toEntity(doc));
    }

    async create(data: Partial<NotificationEntity>): Promise<NotificationEntity> {
        const doc = new this.notificationModel(data);
        const saved = await doc.save();
        return this.toEntity(saved);
    }

    async updateStatus(id: string, status: NotificationStatus, errorMessage?: string): Promise<void> {
        const update: any = { status };

        if (status === NotificationStatus.SENT) {
            update.sentAt = new Date();
            update.updatedAt = new Date();
        }

        if (errorMessage) {
            update.errorMessage = errorMessage;
            update.$inc = { retryCount: 1 };
        }

        await this.notificationModel.updateOne({ _id: id }, update).exec();
    }

    async markAsRead(id: string): Promise<void> {
        await this.notificationModel.updateOne(
            { _id: id },
            { status: NotificationStatus.READ, readAt: new Date() }
        ).exec();
    }

    async findPending(): Promise<NotificationEntity[]> {
        const docs = await this.notificationModel
            .find({ status: NotificationStatus.PENDING })
            .exec();
        return docs.map(doc => this.toEntity(doc));
    }

    async findFailed(): Promise<NotificationEntity[]> {
        const docs = await this.notificationModel
            .find({
                status: NotificationStatus.FAILED,
                retryCount: { $lt: 3 }
            })
            .exec();
        return docs.map(doc => this.toEntity(doc));
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.notificationModel.countDocuments({
            userId,
            status: { $ne: NotificationStatus.READ }
        }).exec();
    }
}
