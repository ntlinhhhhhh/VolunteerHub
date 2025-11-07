import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuthDocument = Auth & Document;

@Schema({ collection: 'auths', timestamps: true, autoIndex: true })
export class Auth {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: Types.ObjectId, ref: "Role", required: true, index: true })
  roleId: Types.ObjectId;

  @Prop({ default: false, index: true })
  isLocked: boolean;

  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop({ default: null })
  lockedAt?: Date;

  @Prop({ default: null })
  lockReason?: string;

  @Prop({ default: null })
  lastLoginAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);

AuthSchema.virtual('role', {
  ref: 'Role',
  localField: 'roleId',
  foreignField: '_id',
  justOne: true,
});

AuthSchema.virtual('isAutoUnlockable').get(function(this: AuthDocument) {
  if (!this.isLocked || !this.lockedAt) {
    return false;
  }

  const lockDuration = 24*60*60*1000;
  const now = new Date();
  return now.getTime() - this.lockedAt.getTime() > lockDuration;
});

AuthSchema.set('toJSON', { 
  virtuals: true,
  transform: function (doc, ret: any) {
    delete ret.passwordHash;
    return ret;
  },
});

AuthSchema.set('toObject', { virtuals: true });

AuthSchema.pre(['findOneAndUpdate', 'updateOne'], async function(next) {
  const update = this.getUpdate() as any;
  
  if (update.$set && update.$set.isLocked === false) {
    update.$set.failedLoginAttempts = 0;
    update.$set.lockedAt = null;
    update.$set.lockReason = null;
  }
  
  next();
});