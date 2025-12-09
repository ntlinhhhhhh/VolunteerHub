import mongoose from 'mongoose';
import { User, UserSchema } from '../schemas/user.schema';

async function seed() {
    try {
        await mongoose.connect(
            process.env.MONGO_URI || 'mongodb://volunteer-mongo:27017/user-service'
        )
        console.log('Connected to MongoDB (User-service)');

        const UserModel = mongoose.model('User', UserSchema);

        await seedAdmin(UserModel);
        await seedEventManager(UserModel);

        console.log('User seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('User seeding failed:', error);
        process.exit(1);
    }
}

async function seedAdmin(UserModel: mongoose.Model<User>) {
    const existing = await UserModel.findOne({ email: 'nguyenthuylinh26012005@gmail.com' });
    if (existing) {
        console.log('Admin profile already exists');
        return;
    }

    const newUser = await UserModel.create({
        email: 'nguyenthuylinh26012005@gmail.com',
        fullName: 'Thuy Linh',
        username: 'admin',
        authId: '69345f459debb104835c38e9',
        phoneNumber: '+84901234567',
        avatar: '',
        bio: 'System administrator',
        isActive: true,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
    });


    console.log('Admin profile created with userId:', newUser._id);
}

async function seedEventManager(UserModel: mongoose.Model<User>) {
    const existing = await UserModel.findOne({ email: 'duonghoangg261@gmail.com' });
    if (existing) {
        console.log('Event manager profile already exists');
        return;
    }

    const newUser = await UserModel.create({
        email: 'duonghoangg261@gmail.com',
        fullName: 'Thuy Linh Manager',
        username: 'event_manager',
        authId: '69345f459debb104835c38ed',
        phoneNumber: '+84909876543',
        avatar: '',
        bio: 'Event manager',
        isActive: true,
        role: 'event_manager',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    console.log('✅ Event manager profile created with userId:', newUser._id);
}

seed();
