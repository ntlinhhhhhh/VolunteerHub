import {Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request,} 
from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase
  ) {}

  /**
   * GET /users/me
   * Lấy profile của user hiện tại (từ JWT token)
   */
  @Get('me')
  async getMyProfile(@Request() req) {
    // req.user.userId lấy từ JWT token
    const user = await this.getUserProfileUseCase.execute(req.user.userId);
    return {
      success: true,
      data: user.toSafeObject(),
    };
  }

  /**
   * PUT /users/me
   * Update profile của user hiện tại
   */
  @Put('me')
  async updateMyProfile(@Request() req, @Body() updateDto: UpdateUserDto) {
    const user = await this.updateUserProfileUseCase.execute(
      req.user.userId,
      updateDto
    );
    return {
      success: true,
      message: 'Cập nhật profile thành công',
      data: user.toSafeObject(),
    };
  }

  /**
   * GET /users/:id
   * Lấy profile của user khác (public)
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.getUserProfileUseCase.execute(id);
    return {
      success: true,
      data: user.toSafeObject(),
    };
  }

  /**
   * TCP MESSAGE: user.create
   * Auth Service gọi để tạo user profile sau khi register
   */
  @MessagePattern('user.create')
  async createUser(@Payload() data: CreateUserDto) {
    const user = await this.createUserUseCase.execute(
      data.authId,
      data.email,
      data.fullName
    );
    return {
      success: true,
      data: user.toSafeObject(),
    };
  }

  /**
   * TCP MESSAGE: user.findByAuthId
   * Tìm user profile theo authId
   */
  @MessagePattern('user.findByAuthId')
  async findByAuthId(@Payload() data: { authId: string }) {
    const user = await this.getUserProfileUseCase.executeByAuthId(data.authId);
    return user.toSafeObject();
  }
}