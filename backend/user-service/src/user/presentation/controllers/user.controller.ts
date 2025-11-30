import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, }
    from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { JwtPayload } from 'jsonwebtoken';
import { JwtAuthGuard } from 'user/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly getUserProfileUseCase: GetUserProfileUseCase,
        private readonly updateUserProfileUseCase: UpdateUserProfileUseCase
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMyProfile(@Request() req) {
        console.log(req.user);
        const user = await this.getUserProfileUseCase.executeByAuthId(req.user.userId);
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
            message: 'Update profile successfull',
            data: user.toSafeObject(),
        };
    }


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