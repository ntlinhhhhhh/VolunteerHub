import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, }
    from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { JwtAuthGuard } from '@share/auth/jwt-auth.guard';
import { Roles } from '@share/auth/roles.decorator'

// @UseGuards(RolesGuard)
@Controller('users')
export class UserController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly getUserProfileUseCase: GetUserProfileUseCase,
        private readonly updateUserProfileUseCase: UpdateUserProfileUseCase
    ) { }

    @Roles('admin')
    @Get()
    async findAll() {
        const users = await this.getUserProfileUseCase.executeAll();
        return {
            success: true,
            data: users || null,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMyProfile(@Request() req) {
        try {
            console.log('Headers:', req.headers);
            console.log('Authorization:', req.headers.authorization);
            console.log('req.user', req.user);
            console.log('req.user', req.user);
            const user = await this.getUserProfileUseCase.executeByAuthId(req.user.userId);
            return {
                success: true,
                data: user?.toSafeObject() || null,
            };
        } catch (err) {
            console.error(err)
        }
        
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
            message: 'Update profile successfull',
            data: user.toSafeObject(),
        };
    }


    @Roles('ADMIN', 'EVENT_MANAGER')
    @Get(':id')
    async getUserById(@Param('id') id: string) {
        const user = await this.getUserProfileUseCase.execute(id);
        return {
            success: true,
            data: user.toSafeObject(),
        };
    }

    @MessagePattern('user.create')
    async createUser(@Payload() data: CreateUserDto) {
        try {
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
        }catch(err) {
            console.error(err);
        }

    }

    @MessagePattern('user.findByAuthId')
    async findByAuthId(@Payload() data: { authId: string }) {
        const user = await this.getUserProfileUseCase.executeByAuthId(data.authId);
        return user.toSafeObject();
    }

    @MessagePattern('user.findByEmail')
    async findByEmail(@Payload() data: { email: string }) {
        const user = await this.getUserProfileUseCase.executeByEmail(data.email);
        return user.toSafeObject();
    }
}

// import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, Inject } from '@nestjs/common';
// import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
// import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
// import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
// import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
// // import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case.ts';
// // import { UpdateUserRoleUseCase } from '../../application/use-cases/update-user-role.use-case.ts';
// // import { BlockUserUseCase } from '../../application/use-cases/block-user.use-case';
// // import { UnblockUserUseCase } from '../../application/use-cases/unblock-user.use-case';
// import { CreateUserDto } from '../../application/dto/create-user.dto';
// import { UpdateUserDto } from '../../application/dto/update-user.dto';
// import { JwtAuthGuard } from '@share/auth/jwt-auth.guard';
// import { RolesGuard } from '@share/auth/roles.guard';
// import { Roles } from '@share/auth/roles.decorator';
// import { firstValueFrom } from 'rxjs';

// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('users')
// export class UserController {
//     constructor(
//         @Inject('AUTH_SERVICE') private userClient: ClientProxy,
        
//         private readonly createUserUseCase: CreateUserUseCase,
//         private readonly getUserProfileUseCase: GetUserProfileUseCase,
//         private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
//         // private readonly deleteUserUseCase: DeleteUserUseCase,
//         // private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
//         // private readonly blockUserUseCase: BlockUserUseCase,
//         // private readonly unblockUserUseCase: UnblockUserUseCase,
//     ) {}

//     // profile-user
//     @Get('me')
//     async getMyProfile(@Request() req) {
//         try {
//             console.log('Headers:', req.headers);
//             console.log('Authorization:', req.headers.authorization);
//             console.log('req.user', req.user);
//             console.log('req.user', req.user);
//             const user = await this.getUserProfileUseCase.executeByAuthId(req.user.userId);
//             return {
//                 success: true,
//                 data: user?.toSafeObject() || null,
//             };
//         } catch (err) {
//             console.error(err)
//         }
        
//     }

//     @Put('me')
//     async updateMyProfile(@Request() req, @Body() updateDto: UpdateUserDto) {
//         const user = await this.updateUserProfileUseCase.execute(req.user.userId, updateDto);
//         return { success: true, message: 'Update profile successful', data: user.toSafeObject() };
//     }

//     // admin
//     @Roles('admin')
//     @Get()
//     async findAllUsers() {
//         const users = await this.getUserProfileUseCase.executeAll();
//         return { success: true, data: users || null };
//     }

//     // @Roles('admin')
//     // @Get('search')
//     // async searchUsers(@Query('q') query: string, @Query('role') role?: string) {
//     //     const users = await this.getUserProfileUseCase.search(query, role);
//     //     return { success: true, data: users };
//     // }

//     @Roles('admin')
//     @Get(':id')
//     async getUserById(@Param('id') id: string) {
//         const user = await this.getUserProfileUseCase.execute(id);
//         return { success: true, data: user?.toSafeObject() || null };
//     }

//     // @Roles('admin')
//     // @Put(':id/role')
//     // async updateUserRole(@Param('id') id: string, @Body('role') role: string) {
//     //     const user = await this.updateUserRoleUseCase.execute(id, role);
//     //     return { success: true, data: user.toSafeObject() };
//     // }

//     // @Roles('admin')
//     // @Delete(':id')
//     // async deleteUser(@Param('id') id: string) {
//     //     await this.deleteUserUseCase.execute(id);
//     //     return { success: true, message: 'User deleted' };
//     // }

//     @Roles('admin')
//     @Put(':id/lock')
//     async LockUser(@Param('id') id: string, @Body('reason') reason: string) {
//         await firstValueFrom(
//             this.userClient.send('auth.lock', {
//                 userId: id,
//                 reason: reason || 'Locked by admin',
//             })
//         );
//         return { success: true, message: `User ${id} is locked`, reason: reason || 'Locked by admin' };
//     }


//     @Roles('admin')
//     @Put(':id/unlock')
//     async UnlockUser(@Param('id') id: string) {
//         await firstValueFrom(
//             this.userClient.send('auth.lock', {
//                 userId: id,
//             })
//         );
//         return { success: true, message: `User ${id} is locked`};
//     }

//     // // ---------------- Admin + Event Manager ----------------
//     // @Roles('admin', 'event_manager')
//     // @Get('role/:role')
//     // async getUsersByRole(@Param('role') role: string) {
//     //     const users = await this.getUserProfileUseCase.executeByRole(role);
//     //     return { success: true, data: users };
//     // }

//     // ---------------- Microservice endpoints ----------------
//     @MessagePattern('user.create')
//     async createUser(@Payload() data: CreateUserDto) {
//         const user = await this.createUserUseCase.execute(data.authId, data.email, data.username, data.fullName);
//         return { success: true, data: user.toSafeObject() };
//     }

//     @MessagePattern('user.findByAuthId')
//     async findByAuthId(@Payload() data: { authId: string }) {
//         const user = await this.getUserProfileUseCase.executeByAuthId(data.authId);
//         return user?.toSafeObject() || null;
//     }

//     @MessagePattern('user.findByEmail')
//     async findByEmail(@Payload() data: { email: string }) {
//         const user = await this.getUserProfileUseCase.executeByEmail(data.email);
//         return user?.toSafeObject() || null;
//     }
// }
