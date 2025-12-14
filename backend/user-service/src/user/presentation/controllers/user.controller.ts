import {
    Controller,
    Get,
    Put,
    Body,
    Param,
    Request,
    UseGuards,
    Query,
    Patch,
    UseInterceptors,
    Post,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { JwtAuthGuard } from '@share/auth/jwt-auth.guard';
import { RolesGuard } from '@share/auth/roles.guard';
import { Roles } from '@share/auth/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { GetUser } from '@share/auth/get-user.decorator';
import { User, UserStatus } from 'src/user/domain/entities/user.entity';
import { UpdateAvatarUseCase } from 'src/user/application/use-cases/update-avatar.use-case';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';


@Controller('users')
export class UserController {
    constructor(
        @Inject('AUTH_SERVICE') private userClient: ClientProxy,

        private readonly createUserUseCase: CreateUserUseCase,
        private readonly getUserProfileUseCase: GetUserProfileUseCase,
        private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
        private readonly updateAvatarUseCase: UpdateAvatarUseCase,
    ) { }

    // volunteer 
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMyProfile(@Request() req) {
        const user = await this.getUserProfileUseCase.executeByAuthId(
            req.user.userId
        );
        return {
            success: true,
            data: user?.toSafeObject() || null,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Put('me')
    async updateMyProfile(@GetUser() auth, @Body() updateDto: UpdateUserDto) {
        console.log('getUser', auth)
        const user = await this.updateUserProfileUseCase.execute(
            auth.userId,
            updateDto
        );

        return {
            success: true,
            message: 'Profile updated',
            data: user.toSafeObject(),
        };
    }



    //  admin
    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    async findAll(
        @Query()
        filters?: {
            status?: UserStatus;
            role?: string,
            page?: number;
            limit?: number;
        }) {

        console.log('filters', filters);

        const users = await this.getUserProfileUseCase.executeAll(filters);
        console.log('users-filter', users);

        return {
            success: true,
            data: users || [],
        };
    }

    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(':id')
    async getUserById(@Param('id') id: string) {
        const user = await this.getUserProfileUseCase.execute(id);
        return {
            success: true,
            data: user?.toSafeObject() || null,
        };
    }

    @Post(':id/avatar')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/avatars',
            filename: (req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const ext = extname(file.originalname);
                cb(null, `${uniqueSuffix}${ext}`);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new BadRequestException('Only image files are allowed'), false);
            }
            cb(null, true);
        },
    }))
    async updateAvatar(
        @Param('id') userId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) throw new BadRequestException('No file uploaded');

        const avatarPath = await this.updateAvatarUseCase.execute(userId, file);
        return { success: true, avatar: avatarPath };
    }

    @MessagePattern('user.create')
    async createUser(@Payload() data: CreateUserDto) {
        console.log('Received user.create payload:', data);
        return await this.createUserUseCase.execute(
            data.authId,
            data.email,
            data.username,
            data.fullName,
            data.avatar,
        );
    }

    @MessagePattern('user.update')
    async updateUser(
        @Payload() data: { authId: string; profileData: Partial<User> }
    ): Promise<User> {
        const { authId, profileData } = data;

        // gọi use-case
        return await this.updateUserProfileUseCase.execute(authId, profileData);
    }



    @MessagePattern('user.findByAuthId')
    async findByAuthId(@Payload() data: { authId: string }) {
        console.log('call user.findByAuthId');
        const user = await this.getUserProfileUseCase.executeByAuthId(
            data.authId
        );
        return user?.toSafeObject() || null;
    }

    @MessagePattern('user.findByEmail')
    async findByEmail(@Payload() data: { email: string }) {
        console.log('call user.email');

        const user = await this.getUserProfileUseCase.executeByEmail(
            data.email
        );
        return user?.toSafeObject() || null;
    }

    @MessagePattern('user.findByUsername')
    async findByUsername(@Payload() data: { username: string }) {
        console.log('call user.findByUsername');

        const user = await this.getUserProfileUseCase.executeByUsername(
            data.username
        );
        return user?.toSafeObject() || null;
    }

    // @MessagePattern('user.findByRole')
    // async findByRole(@Payload() data: {
    //     status?: UserStatus;
    //     role?: string,
    //     page?: number;
    //     limit?: number;
    // }) {
    //     return await this.getUserProfileUseCase.executeAll({ 
    //         status: data.status,
    //         role: data.role,
    //         page: data.page,
    //         limit: data.limit
    //     });
    // }
}