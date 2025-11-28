import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { seedRoles } from './roles.seed';
import { Role, RoleSchema } from '../schemas/role.schema';
import { Auth, AuthSchema } from '../schemas/auth.schema';

async function seed() {
    try {
        await mongoose.connect(
            process.env.MONGO_URI || 'mongodb://volunteer-mongo:27017/auth-service'
        );
        console.log('📦 Connected to MongoDB');

        const RoleModel = mongoose.model('Role', RoleSchema);
        const AuthModel = mongoose.model('Auth', AuthSchema);

        await seedRoles(RoleModel);

        await seedAdmin(AuthModel, RoleModel);

        console.log('✅ Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();

async function seedAdmin(
    AuthModel: mongoose.Model<Auth>,
    RoleModel: mongoose.Model<Role>
) {
    const existing = await AuthModel.findOne({ email: 'tlinh@gmail.com' });
    if (existing) {
        console.log('✅ Admin already exists');
        return;
    }

    const passwordHash = await bcrypt.hash('tlinh123', 10);

    let adminRole = await RoleModel.findOne({ name: 'Admin' });
    if (!adminRole) {
        console.warn('⚠️ Role "Admin" not found, creating new one...');
        const newAdminRole = await RoleModel.create({
            name: 'Admin',
            description: 'Full system administrator',
            permissions: ['*'],
            isSystem: true,
        });
        adminRole = newAdminRole;
    }

    await AuthModel.create({
        email: 'tlinh@gmail.com',
        passwordHash,
        roleId: adminRole._id,
        isLocked: false,
        lastLoginAt: null,
        failedLoginAttempts: 0,
    });

    console.log('✅ Admin user created (email: admin@example.com / pass: tlinh123)');
}
