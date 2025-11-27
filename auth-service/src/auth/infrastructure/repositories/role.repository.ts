import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { UserRole } from '../../domain/entities/user-role.entity';
import { Role, RoleDocument } from '../database/schemas/role.schema';
import { Permission } from '../../domain/entities/permission.enum';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>
  ) {}

private toEntity(doc: RoleDocument): UserRole {
  return new UserRole(
    (doc._id as any).toString(),
    doc.name,
    doc.permissions,
    doc.description,
    doc.isSystem,
  );
}

  async findById(id: string): Promise<UserRole | null> {
    const doc = await this.roleModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByName(name: string): Promise<UserRole | null> {
    const doc = await this.roleModel.findOne({ name: name.toLowerCase() }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(): Promise<UserRole[]> {
    const docs = await this.roleModel.find().exec();
    return docs.map(doc => this.toEntity(doc));
  }

  async create(roleData: Omit<UserRole, 'id'>): Promise<UserRole> {
    const doc = await this.roleModel.create({
      name: roleData.name,
      permissions: roleData.permissions,
      description: roleData.description,
      isSystem: roleData.isSystem ?? false
    });
    return this.toEntity(doc);
  }

  async update(id: string, data: Partial<UserRole>): Promise<UserRole> {
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.permissions) updateData.permissions = data.permissions;
    if (data.description !== undefined) updateData.description = data.description;

    const doc = await this.roleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!doc) {
      throw new Error(`Role with id ${id} not found`);
    }

    return this.toEntity(doc);
  }

  async delete(id: string): Promise<void> {
    const result = await this.roleModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new Error(`Role with id ${id} not found`);
    }
  }
}