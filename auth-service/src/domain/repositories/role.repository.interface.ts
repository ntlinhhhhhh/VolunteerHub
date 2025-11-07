import { UserRole } from '../entities/user-role.entity';

export interface IRoleRepository {
  findById(id: string): Promise<UserRole | null>;
  findByName(name: string): Promise<UserRole | null>;
  findAll(): Promise<UserRole[]>;
  create(role: Omit<UserRole, 'id'>): Promise<UserRole>;
  update(id: string, data: Partial<UserRole>): Promise<UserRole>;
  delete(id: string): Promise<void>;
}
export const IRoleRepository = Symbol('IRoleRepository');