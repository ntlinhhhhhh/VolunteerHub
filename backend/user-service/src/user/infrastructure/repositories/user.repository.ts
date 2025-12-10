import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User as UserEntity, UserStatus } from '../../domain/entities/user.entity';
import { User as UserSchema, UserDocument } from '../database/schemas/user.schema';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectModel(UserSchema.name)
        private readonly userModel: Model<UserDocument>
    ) { }

    private toEntity(doc: UserDocument): UserEntity {
        return new UserEntity(
            (doc._id as any).toString(),
            doc.authId,
            doc.email,
            doc.username,
            doc.fullName,
            doc.phoneNumber,
            doc.avatar,
            doc.address,
            doc.bio,
            doc.dateOfBirth,
            doc.status,
            doc.createdAt,
            doc.updatedAt
        );
    }

    async findById(id: string): Promise<UserEntity | null> {
        const doc = await this.userModel.findById(id).exec();
        return doc ? this.toEntity(doc) : null;
    }

    async findByAuthId(authId: string): Promise<UserEntity | null> {
        const doc = await this.userModel.findOne({ authId }).exec();
        console.log("findByAuthId");
        return doc ? this.toEntity(doc) : null;
    }

    async findByUsername(username: string): Promise<UserEntity | null> {
        const doc = await this.userModel.findOne({ username }).exec();
        console.log("findByUsername");
        return doc ? this.toEntity(doc) : null;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const doc = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
        return doc ? this.toEntity(doc) : null;
    }

    async create(data: {
        authId: string;
        email: string;
        username: string,
        fullName: string;
    }): Promise<UserEntity> {
        const doc = new this.userModel({
            authId: data.authId,
            email: data.email.toLowerCase(),
            username: data.username,
            fullName: data.fullName,
            status: UserStatus.ACTIVE,
        });
        const saved = await doc.save();
        return this.toEntity(saved);
    }

    async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
        const doc = await this.userModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();

        if (!doc) {
            throw new Error('User not found');
        }

        return this.toEntity(doc);
    }

    async updateAvatar(userId: string, avatarPath: string): Promise<UserEntity | null> {
        return this.userModel.findByIdAndUpdate(
            userId,
            { avatar: avatarPath },
            { new: true },
        );
    }


    async updateStatus(id: string, status: UserStatus): Promise<void> {
        await this.userModel.updateOne({ _id: id }, { status }).exec();
    }

    async delete(id: string): Promise<void> {
        await this.userModel.deleteOne({ _id: id }).exec();
    }

    async findAll
        (filters?: {
            status?: UserStatus;
            page?: number;
            limit?: number;
        }): Promise<{ users: UserEntity[]; total: number }> {
        const query: any = {};

        if (filters?.status) {
            query.status = filters.status;
        }

        const hasPagination =
            filters?.page !== undefined &&
            filters?.limit !== undefined;

        let docs: any[];
        let total: number;

        if (hasPagination) {
            const page = filters.page!;
            const limit = filters.limit!;
            const skip = (page - 1) * limit;

            [docs, total] = await Promise.all([
                this.userModel.find(query).skip(skip).limit(limit).exec(),
                this.userModel.countDocuments(query).exec(),
            ]);
        } else {
            [docs, total] = await Promise.all([
                this.userModel.find(query).exec(),
                this.userModel.countDocuments(query).exec(),
            ]);
        }

        return {
            users: docs.map(doc => this.toEntity(doc)),
            total,
        };
    }

}