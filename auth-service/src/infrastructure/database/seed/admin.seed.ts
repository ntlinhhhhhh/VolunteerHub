import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Auth } from '../schemas/auth.schema';
import { Role } from '../schemas/role.schema';

export async function seedAdmin(
  authModel: Model<Auth>,
  roleModel: Model<Role>
) {
  // Check if admin exists
  const adminExists = await authModel.findOne({ 
    email: 'admin@volunteer.hub' 
  });

  if (adminExists) {
    console.log('✅ Admin already exists');
    return;
  }

  console.log('🌱 Creating admin account...');

  // Get admin role
  const adminRole = await roleModel.findOne({ name: 'admin' });
  if (!adminRole) {
    throw new Error('Admin role not found. Run seedRoles first!');
  }

  // Create admin
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  
  await authModel.create({
    email: 'admin@volunteer.hub',
    passwordHash,
    roleId: adminRole._id,
    isLocked: false,
    failedLoginAttempts: 0,
  });

  console.log('✅ Admin created successfully');
  console.log('📧 Email: admin@volunteer.hub');
  console.log('🔑 Password: Admin@123');
  console.log('⚠️  REMEMBER TO CHANGE PASSWORD AFTER FIRST LOGIN!');
}
