import { Injectable, Logger } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { Role, RoleSchema } from '../schemas/role.schema';
import { Auth, AuthSchema } from '../schemas/auth.schema';
import { Permission } from 'src/auth/domain/entities/permission.enum';

@Injectable()
export class AuthSeeder {
  private readonly logger = new Logger(AuthSeeder.name);

  private RoleModel: Model<Role>;
  private AuthModel: Model<Auth>;

  constructor() {
    this.RoleModel = mongoose.model('Role', RoleSchema);
    this.AuthModel = mongoose.model('Auth', AuthSchema);
  }

  async seed() {
    try {
      await mongoose.connect(
        process.env.MONGO_URI || 'mongodb://volunteer-mongo:27017/auth-service'
      );
      this.logger.log('📦 Connected to MongoDB');

      await this.seedRoles();
      await this.seedAdmin();
      await this.seedEventManager();

      this.logger.log('Auth seeding completed.');
      process.exit(0);
    } catch (error) {
      this.logger.error('Seeding failed:', error);
      process.exit(1);
    }
  }

  private async seedRoles() {
    const count = await this.RoleModel.countDocuments();
    if (count > 0) {
      this.logger.log('Roles already seeded');
      return;
    }

    this.logger.log('Seeding roles...');

    await this.RoleModel.create({
      name: 'admin',
      description: 'System administrator with full access',
      isSystem: true,
      permissions: ['*'],
    });

    await this.RoleModel.create({
      name: 'event_manager',
      description: 'Can create and manage events',
      isSystem: true,
      permissions: [
        Permission.EVENT_CREATE,
        Permission.EVENT_READ,
        Permission.EVENT_UPDATE,
        Permission.EVENT_DELETE,
        Permission.EVENT_APPROVE,
        Permission.EVENT_REJECT,
        Permission.REGISTRATION_READ,
        Permission.REGISTRATION_APPROVE,
        Permission.REGISTRATION_MARK_COMPLETE,
        Permission.POST_CREATE,
        Permission.POST_READ,
        Permission.POST_UPDATE_OWN,
        Permission.POST_DELETE_OWN,
        Permission.COMMENT_CREATE,
        Permission.DASHBOARD_VIEW,
        Permission.REPORT_VIEW,
        Permission.REPORT_EXPORT,
      ],
    });

    await this.RoleModel.create({
      name: 'volunteer',
      description: 'Regular volunteer user',
      isSystem: true,
      permissions: [
        Permission.EVENT_READ,
        Permission.REGISTRATION_CREATE,
        Permission.REGISTRATION_READ,
        Permission.REGISTRATION_CANCEL,
        Permission.POST_READ,
        Permission.POST_CREATE,
        Permission.POST_UPDATE_OWN,
        Permission.POST_DELETE_OWN,
        Permission.COMMENT_CREATE,
        Permission.DASHBOARD_VIEW,
      ],
    });

    this.logger.log('Roles seeded successfully');
  }

  private async seedAdmin() {
    const existing = await this.AuthModel.findOne({ email: 'tlinh@gmail.com' });
    if (existing) {
      this.logger.log('Admin already exists');
      return;
    }

    const passwordHash = await bcrypt.hash('tlinh123', 10);
    let adminRole = await this.RoleModel.findOne({ name: 'admin' });
    if (!adminRole) {
      this.logger.warn('Role "Admin" not found, creating...');
      adminRole = await this.RoleModel.create({
        name: 'admin',
        description: 'Full system administrator',
        permissions: ['*'],
        isSystem: true,
      });
    }

    await this.AuthModel.create({
      email: 'tlinh@gmail.com',
      passwordHash,
      roleId: adminRole._id,
      isLocked: false,
      lastLoginAt: null,
      failedLoginAttempts: 0,
    });

    this.logger.log('Admin user created (email: tlinh@gmail.com / pass: tlinh123)');
  }

  private async seedEventManager() {
    const existing = await this.AuthModel.findOne({ email: 'tlinh_manager@gmail.com' });
    if (existing) {
      this.logger.log('Event manager already exists');
      return;
    }

    const passwordHash = await bcrypt.hash('tlinh123', 10);
    let eventManagerRole = await this.RoleModel.findOne({ name: 'event_manager' });
    if (!eventManagerRole) {
      this.logger.warn('Role "event_manager" not found, creating...');
      eventManagerRole = await this.RoleModel.create({
        name: 'event_manager',
        description: 'event manager',
        permissions: [
          Permission.EVENT_CREATE,
          Permission.EVENT_READ,
          Permission.EVENT_UPDATE,
          Permission.EVENT_DELETE,
          Permission.EVENT_APPROVE,
          Permission.EVENT_REJECT,
          Permission.REGISTRATION_READ,
          Permission.REGISTRATION_APPROVE,
          Permission.REGISTRATION_MARK_COMPLETE,
          Permission.POST_CREATE,
          Permission.POST_READ,
          Permission.POST_UPDATE_OWN,
          Permission.POST_DELETE_OWN,
          Permission.COMMENT_CREATE,
          Permission.DASHBOARD_VIEW,
          Permission.REPORT_VIEW,
          Permission.REPORT_EXPORT,
        ],
        isSystem: true,
      });
    }

    await this.AuthModel.create({
      email: 'tlinh_manager@gmail.com',
      passwordHash,
      roleId: eventManagerRole._id,
      isLocked: false,
      lastLoginAt: null,
      failedLoginAttempts: 0,
    });

    this.logger.log(
      'Event manager user created (email: tlinh_manager@gmail.com / pass: tlinh123)'
    );
  }
}
