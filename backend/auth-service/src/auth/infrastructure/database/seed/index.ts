import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { seedRoles } from './roles.seed';
import { Role, RoleSchema } from '../schemas/role.schema';
import { Auth, AuthSchema } from '../schemas/auth.schema';
import { Permission } from 'src/auth/domain/entities/permission.enum';

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

        await seedEventManager(AuthModel, RoleModel)

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

    let adminRole = await RoleModel.findOne({ name: 'admin' });
    if (!adminRole) {
        console.warn('⚠️ Role "Admin" not found, creating new one...');
        const newAdminRole = await RoleModel.create({
            name: 'admin',
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

    console.log('✅ Admin user created (email: tlinh@gmail.com / pass: tlinh123)');
}


async function seedEventManager(
    AuthModel: mongoose.Model<Auth>,
    RoleModel: mongoose.Model<Role>
) {
    const existing = await AuthModel.findOne({ email: 'tlinh_manager@gmail.com' });
    if (existing) {
        console.log('✅ Admin already exists');
        return;
    }

    const passwordHash = await bcrypt.hash('tlinh123', 10);

    let eventMangerRole = await RoleModel.findOne({ name: 'event_manager' });
    if (!eventMangerRole) {
        console.warn('⚠️ Role "event_manager" not found, creating new one...');
        const newEventMagerRole = await RoleModel.create({
            name: 'event_manager',
            description: 'event manager',
            permissions: [
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
            isSystem: true,
        });
        eventMangerRole = newEventMagerRole;
    }

    await AuthModel.create({
        email: 'tlinh_manager@gmail.com',
        passwordHash,
        roleId: eventMangerRole._id,
        isLocked: false,
        lastLoginAt: null,
        failedLoginAttempts: 0,
    });

    console.log('✅ Admin user created (email: tlinh_manager@gamil.com / pass: tlinh123)');
}
