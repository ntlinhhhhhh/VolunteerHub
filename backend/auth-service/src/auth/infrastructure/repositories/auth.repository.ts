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