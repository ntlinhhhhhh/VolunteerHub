import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth as AuthEntity } from '../../domain/entities/auth.entity';
import { Auth as AuthSchema, AuthDocument } from '../database/schemas/auth.schema';
import type { IAuthRepository } from "../../domain/repositories/auth.repository.interface";
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {
    constructor(
        @InjectModel(AuthSchema.name)
        private readonly authModel: Model<AuthDocument>,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) { }

    private async toEntity(doc: AuthDocument): Promise<AuthEntity> {
        const role = await this.roleRepository.findById(doc.roleId.toString());

        return new AuthEntity(
            (doc._id as any).toString(),
            doc.email,
            doc.passwordHash,
            (doc.roleId as any).toString(),
            doc.isLocked,
            doc.lastLoginAt,
            doc.createdAt,
            doc.updatedAt,
            doc.resetPasswordToken,
            doc.resetPasswordExpires,
            role || undefined
        );
    }

    async findAll(): Promise<AuthEntity[] | null> {
        const docs = await this.authModel.find().exec();
        return await Promise.all(docs.map(doc => this.toEntity(doc)));
    }

    async findByEmail(email: string): Promise<AuthEntity | null> {
        const doc = await this.authModel
            .findOne({ email: email.toLowerCase() })
            .select('+passwordHash')
            .exec();

        return doc ? await this.toEntity(doc) : null;
    }

    async findById(id: string): Promise<AuthEntity | null> {
        const doc = await this.authModel
            .findById(id)
            .exec();

        return doc ? await this.toEntity(doc) : null;
    }


    async create(email: string, passwordHash: string, roleId: string): Promise<AuthEntity> {
        const doc = new this.authModel({
            email: email.toLowerCase(),
            passwordHash,
            roleId,
            isLocked: false,
            lastLoginAt: null,
            failedLoginAttempts: 0
        });
        const saved = await doc.save();

        return await this.toEntity(saved);
    }

    async updatePassword(id: string, passwordHash: string): Promise<void> {
        await this.authModel.updateOne(
            { _id: id },
            { passwordHash }
        ).exec();
    }

    async updateRole(id: string, roleId: string): Promise<void> {
        await this.authModel.updateOne(
            { _id: id },
            { roleId }
        ).exec();
    }

    async updateAuth(id: string, authData: Partial<AuthEntity>): Promise<void> {
        await this.authModel.findByIdAndUpdate(
            id,
            authData,
            { new: true }
        ).exec();
    }

    async delete(id: string): Promise<void> {
        await this.authModel.deleteOne({ _id: id }).exec();
    }

    async updateLastLogin(id: string): Promise<void> {
        await this.authModel.updateOne(
            { _id: id },
            {
                lastLoginAt: new Date(),
                failedLoginAttempts: 0
            }
        ).exec();
    }

    async save(auth: AuthEntity): Promise<AuthEntity> {
        const doc = await this.authModel.findByIdAndUpdate(
            auth.id,
            {
                email: auth.email,
                passwordHash: auth.passwordHash,
                roleId: auth.roleId,
                isLocked: auth.isLocked,
                lastLoginAt: auth.lastLoginAt,
                resetPasswordToken: auth.resetPasswordToken,
                resetPasswordExpires: auth.resetPasswordExpires,
                updatedAt: new Date(),
            },
            { new: true }
        ).exec();

        if (!doc) {
            throw new Error('Auth not found');
        }

        return await this.toEntity(doc);
    }

    async findByRoleId(roleId: string): Promise<AuthEntity[]> {
        const docs = await this.authModel.find({ roleId }).exec();
        return Promise.all(docs.map(doc => this.toEntity(doc)));
    }

    async countByRoleId(roleId: string): Promise<number> {
        return this.authModel.countDocuments({ roleId }).exec();
    }

    async count(): Promise<number> {
        return this.authModel.countDocuments().exec();
    }

    async search(
        keyword: string,
        roleId?: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ users: AuthEntity[]; total: number }> {
        const query: any = {};

        if (keyword) {
            query.email = { $regex: keyword, $options: 'i' };
        }

        if (roleId) {
            query.roleId = roleId;
        }

        const skip = (page - 1) * limit;

        const [docs, total] = await Promise.all([
            this.authModel
                .find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.authModel.countDocuments(query).exec(),
        ]);

        const users = await Promise.all(docs.map(doc => this.toEntity(doc)));

        return { users, total };
    }

    async lockAccount(id: string, reason?: string): Promise<void> {
        await this.authModel.updateOne(
            { _id: id },
            {
                isLocked: true,
                lockReason: reason,
                lockedAt: new Date()
            }
        ).exec();
    }

    async unlockAccount(id: string): Promise<void> {
        await this.authModel.updateOne(
            { _id: id },
            {
                isLocked: false,
                lockedAt: null,
                failedLoginAttempts: 0
            }
        ).exec();
    }

    async incrementFailedLoginAttempts(id: string): Promise<number> {
        const result = await this.authModel.findByIdAndUpdate(
            id,
            { $inc: { failedLoginAttempts: 1 } },
            { new: true }
        );
        return result?.failedLoginAttempts || 0;
    }

    async findInactiveUsers(days: number): Promise<AuthEntity[]> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const docs = await this.authModel.find({
            $or: [
                { lastLoginAt: { $lt: cutoffDate } },
                { lastLoginAt: null }
            ]
        }).exec();

        return Promise.all(docs.map(doc => this.toEntity(doc)));
    }

    async findLockedUsers(): Promise<AuthEntity[]> {
        const docs = await this.authModel.find({ isLocked: true }).exec();
        return Promise.all(docs.map(doc => this.toEntity(doc)));
    }
}