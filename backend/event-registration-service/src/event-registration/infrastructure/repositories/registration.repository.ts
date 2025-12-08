import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
    IRegistrationRepository,
    RegistrationFilterOptions,
    PaginatedResult,
} from '../../domain/repositories/registration.repository.interface';
import { Registration as RegistrationEntity } from '../../domain/entities/registration.entity';
import { Registration as RegistrationSchema, RegistrationDocument } from '../database/schema/registration.schema';
import { RegistrationStatus } from '../../domain/entities/registration-status.enum';
import {
    Registration,
    Attendance,
    ApplicationForm,
    Approval,
    Completion,
} from '../../domain/entities/registration.entity';



@Injectable()
export class RegistrationRepository implements IRegistrationRepository {
    constructor(
        @InjectModel(RegistrationSchema.name)
        private readonly registrationModel: Model<RegistrationDocument>
    ) { }

    private toEntity(doc: RegistrationDocument): RegistrationEntity {
        const attendance = doc.attendance
            ? {
                ...doc.attendance,
                checkInMethod:
                    doc.attendance.checkInMethod === 'manual' ||
                        doc.attendance.checkInMethod === 'qr_code' ||
                        doc.attendance.checkInMethod === 'self'
                        ? doc.attendance.checkInMethod
                        : undefined,
                checkOutMethod:
                    doc.attendance.checkOutMethod === 'manual' ||
                        doc.attendance.checkOutMethod === 'qr_code' ||
                        doc.attendance.checkOutMethod === 'self'
                        ? doc.attendance.checkOutMethod
                        : undefined,
            }
            : {};

        const completion = doc.completion || {};

        return new RegistrationEntity(
            doc._id.toString(),
            doc.registrationCode,
            doc.eventId,
            doc.eventTitle,
            doc.eventDate,
            doc.eventLocation,
            doc.organizerId,
            doc.organizerName,
            doc.organizerEmail,
            doc.volunteerId,
            doc.volunteerName,
            doc.volunteerEmail,
            doc.volunteerPhone,
            doc.roleId,
            doc.roleName,
            doc.status,
            doc.applicationForm || {},
            doc.approval || {},
            attendance,
            completion,
            doc.createdAt,
            doc.updatedAt
        );
    }


    async findById(id: string): Promise<RegistrationEntity | null> {
        const doc = await this.registrationModel.findById(id).exec();
        return doc ? this.toEntity(doc) : null;
    }

    async findByCode(code: string): Promise<RegistrationEntity | null> {
        const doc = await this.registrationModel.findOne({ registrationCode: code }).exec();
        return doc ? this.toEntity(doc) : null;
    }

    async findAll(options: RegistrationFilterOptions): Promise<PaginatedResult<RegistrationEntity>> {
        const query: FilterQuery<RegistrationDocument> = {};

        if (options.eventId) {
            query.eventId = options.eventId;
        }

        if (options.volunteerId) {
            query.volunteerId = options.volunteerId;
        }

        if (options.organizerId) {
            query.organizerId = options.organizerId;
        }

        if (options.status) {
            query.status = options.status;
        }

        if (options.roleId) {
            query.roleId = options.roleId;
        }

        if (options.dateFrom || options.dateTo) {
            query.eventDate = {};
            if (options.dateFrom) {
                query.eventDate.$gte = options.dateFrom;
            }
            if (options.dateTo) {
                query.eventDate.$lte = options.dateTo;
            }
        }

        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;

        const sortField = options.sortBy || 'createdAt';
        const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
        const sort: any = { [sortField]: sortOrder };

        const [docs, total] = await Promise.all([
            this.registrationModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
            this.registrationModel.countDocuments(query).exec(),
        ]);

        return {
            data: docs.map(doc => this.toEntity(doc)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async create(data: any): Promise<RegistrationEntity> {
        const doc = new this.registrationModel(data);
        const saved = await doc.save();
        return this.toEntity(saved);
    }

    async update(id: string, data: Partial<RegistrationEntity>): Promise<RegistrationEntity> {
        const doc = await this.registrationModel
            .findByIdAndUpdate(id, { $set: data }, { new: true })
            .exec();

        if (!doc) {
            throw new Error('Registration not found');
        }

        return this.toEntity(doc);
    }

    async delete(id: string): Promise<void> {
        await this.registrationModel.findByIdAndDelete(id).exec();
    }

    async findByEventId(
        eventId: string,
        options?: RegistrationFilterOptions
    ): Promise<PaginatedResult<RegistrationEntity>> {
        return this.findAll({
            ...options,
            eventId,
        });
    }

    async findByVolunteerId(
        volunteerId: string,
        options?: RegistrationFilterOptions
    ): Promise<PaginatedResult<RegistrationEntity>> {
        return this.findAll({
            ...options,
            volunteerId,
        });
    }

    async findByStatus(status: RegistrationStatus): Promise<RegistrationEntity[]> {
        const docs = await this.registrationModel.find({ status }).exec();
        return docs.map(doc => this.toEntity(doc));
    }

    async findExistingRegistration(
        eventId: string,
        volunteerId: string
    ): Promise<RegistrationEntity | null> {
        const doc = await this.registrationModel
            .findOne({ eventId, volunteerId })
            .exec();
        return doc ? this.toEntity(doc) : null;
    }

    async countByEventAndStatus(eventId: string, status: RegistrationStatus): Promise<number> {
        return await this.registrationModel.countDocuments({ eventId, status }).exec();
    }

    async countByStatus(status: RegistrationStatus): Promise<number> {
        return await this.registrationModel.countDocuments({ status }).exec();
    }

    async countByVolunteer(volunteerId: string): Promise<number> {
        return await this.registrationModel.countDocuments({ volunteerId }).exec();
    }

    async getTotalHoursByVolunteer(volunteerId: string): Promise<number> {
        const result = await this.registrationModel.aggregate([
            {
                $match: {
                    volunteerId,
                    status: { $in: [RegistrationStatus.CHECKED_OUT, RegistrationStatus.COMPLETED, RegistrationStatus.RATED] },
                },
            },
            {
                $group: {
                    _id: null,
                    totalHours: { $sum: '$attendance.actualHours' },
                },
            },
        ]);

        return result.length > 0 ? result[0].totalHours || 0 : 0;
    }

    async getUpcomingRegistrations(
        volunteerId: string,
        limit: number = 10
    ): Promise<RegistrationEntity[]> {
        const now = new Date();
        const docs = await this.registrationModel
            .find({
                volunteerId,
                eventDate: { $gte: now },
                status: { $in: [RegistrationStatus.ACCEPTED, RegistrationStatus.CONFIRMED] },
            })
            .sort({ eventDate: 1 })
            .limit(limit)
            .exec();

        return docs.map(doc => this.toEntity(doc));
    }

    async updateStatus(id: string, status: RegistrationStatus): Promise<void> {
        await this.registrationModel.updateOne({ _id: id }, { $set: { status } }).exec();
    }

    async bulkUpdateStatusByEvent(
        eventId: string,
        fromStatus: RegistrationStatus,
        toStatus: RegistrationStatus
    ): Promise<void> {
        await this.registrationModel
            .updateMany(
                { eventId, status: fromStatus },
                { $set: { status: toStatus } }
            )
            .exec();
    }

    async updateVolunteerInfo(
        volunteerId: string,
        data: Partial<{
            volunteerName: string;
            volunteerEmail: string;
            volunteerPhone: string;
        }>
    ): Promise<void> {
        await this.registrationModel
            .updateMany({ volunteerId }, { $set: data })
            .exec();
    }
}