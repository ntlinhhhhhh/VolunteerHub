import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserStatus } from '../../../domain/entities/user.entity';

export type UserDocument = User & Document;

@Schema({ collection: 'users', timestamps: true })
export class User {
    @Prop({ type: String, required: true, unique: true, index: true })
    authId: string;  // -> auth-service

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    // @Prop({ type: String, enum: ['admin', 'event_manager', 'volunteer'], default: 'volunteer' })
    // role: string;

    // @Prop({ default: true })
    // isActive: boolean;

    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    fullName: string;

    @Prop({ default: null })
    phoneNumber: string;

    @Prop({ default: null })
    avatar: string;

    @Prop({ default: null })
    address: string;

    @Prop({ default: null })
    bio: string;

    @Prop({ default: null })
    dateOfBirth: Date;

    @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    createdAt: Date;
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ status: 1 });