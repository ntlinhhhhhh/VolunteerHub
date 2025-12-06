import {
    Controller,
    Get,
    Put,
    Body,
    Param,
    Request,
    UseGuards,
    Query,
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
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UserController {
    constructor(
        @Inject('AUTH_SERVICE') private userClient: ClientProxy,

        private readonly createUserUseCase: CreateUserUseCase,
        private readonly getUserProfileUseCase: GetUserProfileUseCase,
        private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
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
    async updateMyProfile(@Request() req, @Body() updateDto: UpdateUserDto) {
        const user = await this.updateUserProfileUseCase.execute(
            req.user.userId,
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
    async findAll() {
        const users = await this.getUserProfileUseCase.executeAll();
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
    // @Roles('admin')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Get('search')
    // async searchUsers(
    //     @Query('q') q: string,
    //     @Query('role') role?: string,
    //     @Query('page') page: number = 1,
    //     @Query('limit') limit: number = 20,
    // ) {
    //     const users = await this.getUserProfileUseCase.search(
    //         q,
    //         role,
    //         Number(page),
    //         Number(limit),
    //     );

    //     return { success: true, data: users };
    // }



    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/lock')
    async lockUser(@Param('id') id: string, @Body('reason') reason: string) {
        await firstValueFrom(
            this.userClient.send('auth.lock', {
                userId: id,
                reason: reason || 'Locked by admin',
            }),
        );

        return {
            success: true,
            message: `User ${id} locked`,
        };
    }

    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/unlock')
    async unlockUser(@Param('id') id: string) {
        await firstValueFrom(
            this.userClient.send('auth.unlock', { userId: id })
        );

        return {
            success: true,
            message: `User ${id} unlocked`,
        };
    }

    // microsevice
    @MessagePattern('user.create')
    async createUser(@Payload() data: CreateUserDto) {
        const user = await this.createUserUseCase.execute(
            data.authId,
            data.email,
            data.username,
            data.fullName
        );
        return {
            success: true,
            data: user.toSafeObject(),
        };
    }

    @MessagePattern('user.findByAuthId')
    async findByAuthId(@Payload() data: { authId: string }) {
        const user = await this.getUserProfileUseCase.executeByAuthId(
            data.authId
        );
        return user?.toSafeObject() || null;
    }

    @MessagePattern('user.findByEmail')
    async findByEmail(@Payload() data: { email: string }) {
        const user = await this.getUserProfileUseCase.executeByEmail(
            data.email
        );
        return user?.toSafeObject() || null;
    }
}
