import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { ClientProxyFactory, Transport, ClientProxy } from '@nestjs/microservices';

import { Role, RoleSchema } from '../schemas/role.schema';
import { Auth, AuthSchema } from '../schemas/auth.schema';
import { Permission } from '../../../domain/entities/permission.enum';

const userClient: ClientProxy = ClientProxyFactory.create({
    transport: Transport.REDIS,
    options: {
        host: process.env.REDIS_HOST || 'redis', // docker service name
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        retryAttempts: 5,
        retryDelay: 3000,
    },
});

async function seed() {
    try {
        // Connect MongoDB
        const uri = process.env.MONGO_URI || 'mongodb://volunteer-mongo:27017/auth-service';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB (auth-service)');

        const RoleModel = mongoose.model<Role>('Role', RoleSchema);
        const AuthModel = mongoose.model<Auth>('Auth', AuthSchema);

        // Connect userClient
        await userClient.connect();

        // Seed roles
        await seedRoles(RoleModel);

        // Seed users
        await seedUser(RoleModel, AuthModel, {
            email: 'nguyenthuylinh26012005@gmail.com',
            username: 'tlinh',
            fullName: 'Thuy Linh',
            roleName: 'admin',
            password: 'tlinh123',
        });

        await seedUser(RoleModel, AuthModel, {
            email: 'duonghoangg261@gmail.com',
            username: 'duonghoang',
            fullName: 'Duong Hoang',
            roleName: 'event_manager',
            password: 'tlinh123',
        });

        await seedUser(RoleModel, AuthModel, {
            email: 'tlinh123@gmail.com',
            username: 'tlinh123',
            fullName: 'Nguyen Thuy Linh',
            roleName: 'volunteer',
            password: 'tlinh123',
        });

        console.log('✅ Auth seeding completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Auth seeding error:', err);
        process.exit(1);
    }
}

// === Seed Roles ===
async function seedRoles(RoleModel: mongoose.Model<Role>) {
    const count = await RoleModel.countDocuments();
    if (count > 0) return;

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

    console.log('✅ Roles seeded');
}

// === Seed Users ===
interface UserSeed {
    email: string;
    username: string;
    fullName: string;
    roleName: string;
    password: string;
}

async function seedUser(
    RoleModel: mongoose.Model<Role>,
    AuthModel: mongoose.Model<Auth>,
    userData: UserSeed,
) {
    const exists = await AuthModel.findOne({ email: userData.email });
    if (exists) {
        console.log(`⚠️ ${userData.roleName} already exists: ${userData.email}`);
        return;
    }

    const role = await RoleModel.findOne({ name: userData.roleName });
    if (!role) {
        console.error(`❌ Role ${userData.roleName} missing. Cannot create user.`);
        return;
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);

    const authUser = await AuthModel.create({
        email: userData.email,
        passwordHash,
        roleId: role._id,
        isLocked: false,
    });

    console.log(`✅ ${userData.roleName} created: ${userData.email} / pass=${userData.password}`);

    // Gửi sang user-service
    try {
        await firstValueFrom(
            userClient.send('user.create', {
                authId: authUser._id.toString(),
                email: authUser.email,
                username: userData.username,
                fullName: userData.fullName,
            }),
        );
        console.log(`✅ User record created in user-service for ${userData.email}`);
    } catch (err) {
        console.error(`❌ Failed to create user-service record for ${userData.email}:`, err);
    }
}

seed();
