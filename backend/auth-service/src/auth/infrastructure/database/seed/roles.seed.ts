import { Model } from 'mongoose';
import { Permission } from '../../../domain/entities/permission.enum';
import { Role } from '../schemas/role.schema';

export async function seedRoles(roleModel: Model<Role>) {
  // Check if already seeded
  const count = await roleModel.countDocuments();
  if (count > 0) {
    console.log('✅ Roles already seeded');
    return;
  }

  console.log('🌱 Seeding roles...');

  // 1. ADMIN - Full permissions
  await roleModel.create({
    name: 'admin',
    description: 'System administrator with full access',
    isSystem: true,
    permissions: Object.values(Permission), // ALL permissions
  });

  // 2. EVENT MANAGER - Manage events + registrations
  await roleModel.create({
    name: 'event_manager',
    description: 'Can create and manage events',
    isSystem: true,
    permissions: [
      // Event permissions
      Permission.EVENT_CREATE,
      Permission.EVENT_READ,
      Permission.EVENT_UPDATE,
      Permission.EVENT_DELETE,
      Permission.EVENT_APPROVE,
      Permission.EVENT_REJECT,
      
      // Registration permissions
      Permission.REGISTRATION_READ,
      Permission.REGISTRATION_APPROVE,
      Permission.REGISTRATION_MARK_COMPLETE,
      
      // Communication
      Permission.POST_CREATE,
      Permission.POST_READ,
      Permission.POST_UPDATE_OWN,
      Permission.POST_DELETE_OWN,
      Permission.COMMENT_CREATE,
      
      // Dashboard
      Permission.DASHBOARD_VIEW,
      Permission.REPORT_VIEW,
      Permission.REPORT_EXPORT,
    ],
  });

  // 3. VOLUNTEER - Basic permissions
  await roleModel.create({
    name: 'volunteer',
    description: 'Regular volunteer user',
    isSystem: true,
    permissions: [
      // Can view events
      Permission.EVENT_READ,
      
      // Can register for events
      Permission.REGISTRATION_CREATE,
      Permission.REGISTRATION_READ,
      Permission.REGISTRATION_CANCEL,
      
      // Can interact with posts
      Permission.POST_READ,
      Permission.POST_CREATE,
      Permission.POST_UPDATE_OWN,
      Permission.POST_DELETE_OWN,
      Permission.COMMENT_CREATE,
      
      // Basic dashboard
      Permission.DASHBOARD_VIEW,
    ],
  });

  console.log('✅ Roles seeded successfully');
}