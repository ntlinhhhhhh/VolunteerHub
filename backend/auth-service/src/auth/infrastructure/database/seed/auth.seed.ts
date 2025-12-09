import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { Role, RoleSchema } from '../schemas/role.schema';
import { Auth, AuthSchema } from '../schemas/auth.schema';
import { Permission } from '../../../domain/entities/permission.enum';

async function seed() {
    try {
        const uri =
            process.env.MONGO_URI ||
            'mongodb://volunteer-mongo:27017/auth-service';

        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB (auth-service)');

        const RoleModel = mongoose.model<Role>('Role', RoleSchema);
        const AuthModel = mongoose.model<Auth>('Auth', AuthSchema);

        await seedRoles(RoleModel);
        await seedAdmin(RoleModel, AuthModel);
        await seedEventManager(RoleModel, AuthModel);
        await seedVolunteer(RoleModel, AuthModel);

        console.log('Auth seeding completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Auth seeding error:', err);
        process.exit(1);
    }
}

/* =====================================================
 * 1) ROLES
 * ===================================================== */
async function seedRoles(RoleModel: mongoose.Model<Role>) {
    try {
        const count = await RoleModel.countDocuments();
        if (count > 0) {
            console.log('Roles already exist');
            return;
        }

        await RoleModel.create([
            {
                name: 'admin',
                description: 'System administrator',
                isSystem: true,
                permissions: ['*'],
            },
            {
                name: 'event_manager',
                description: 'Event manager',
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
            },
            {
                name: 'volunteer',
                description: 'Volunteer user',
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
            },
        ]);

        console.log('Roles seeded');
    } catch (err) {
        console.error('Error seeding roles:', err);
    }
}

/* =====================================================
 * 2) ADMIN
 * ===================================================== */
async function seedAdmin(
    RoleModel: mongoose.Model<Role>,
    AuthModel: mongoose.Model<Auth>
) {
    try {
        const exists = await AuthModel.findOne({ email: 'tlinh@gmail.com' });
        if (exists) {
            console.log('Admin already exists');
            return;
        }

        const role = await RoleModel.findOne({ name: 'admin' });
        if (!role) {
            console.error('Admin role missing. Cannot create admin user.');
            return;
        }

        const passwordHash = await bcrypt.hash('tlinh123', 10);

        await AuthModel.create({
            email: 'tlinh@gmail.com',
            passwordHash,
            roleId: role._id,
            isLocked: false,
        });

        console.log('Admin created: email=tlinh@gmail.com / pass=tlinh123');
    } catch (err) {
        console.error('Error seeding admin:', err);
    }
}

/* =====================================================
 * 3) EVENT MANAGER
 * ===================================================== */
async function seedEventManager(
    RoleModel: mongoose.Model<Role>,
    AuthModel: mongoose.Model<Auth>
) {
    try {
        const exists = await AuthModel.findOne({
            email: 'tlinh_manager@gmail.com',
        });
        if (exists) {
            console.log('Event manager already exists');
            return;
        }

        const role = await RoleModel.findOne({ name: 'event_manager' });
        if (!role) {
            console.error('event_manager role missing. Cannot create user.');
            return;
        }

        const passwordHash = await bcrypt.hash('tlinh123', 10);

        await AuthModel.create({
            email: 'tlinh_manager@gmail.com',
            passwordHash,
            roleId: role._id,
            isLocked: false,
        });

        console.log(
            'Event manager created: email=tlinh_manager@gmail.com / pass=tlinh123'
        );
    } catch (err) {
        console.error('Error seeding event manager:', err);
    }
}

/* =====================================================
 * 4) VOLUNTEER (optional)
 * ===================================================== */
async function seedVolunteer(
    RoleModel: mongoose.Model<Role>,
    AuthModel: mongoose.Model<Auth>
) {
    try {
        const exists = await AuthModel.findOne({
            email: 'volunteer@gmail.com',
        });
        if (exists) {
            console.log('Volunteer already exists');
            return;
        }

        const role = await RoleModel.findOne({ name: 'volunteer' });
        if (!role) {
            console.error('volunteer role missing. Cannot create user.');
            return;
        }

        const passwordHash = await bcrypt.hash('volunteer123', 10);

        await AuthModel.create({
            email: 'volunteer@gmail.com',
            passwordHash,
            roleId: role._id,
            isLocked: false,
        });

        console.log(
            'Volunteer created: email=volunteer@gmail.com / pass=volunteer123'
        );
    } catch (err) {
        console.error('Error seeding volunteer:', err);
    }
}

seed();
