import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Permission } from '../../../domain/entities/permission.enum';

export type RoleDocument = Role & Document;

@Schema({ collection: 'roles', timestamps: true, autoIndex: true })
export class Role {
  @Prop({ required: true, unique: true, trim: true, index: true })
  name: string;

  @Prop({ type: [String], enum: [...Object.values(Permission), '*'], required: true, default: [] })
  permissions: Permission[];

  @Prop({ trim: true })
  description: string;

  @Prop({ default: false, index: true })
  isSystem: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.pre('findOneAndDelete', async function(next) {
  const doc = await this.model.findOne(this.getFilter);
  if (doc?.isSystem) {
    throw new Error('Cannot delete system role');
  }
  next();
})