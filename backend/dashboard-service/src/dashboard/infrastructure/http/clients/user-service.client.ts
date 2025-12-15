import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
    skills?: string[];
    interests?: string[];
    location?: string;
    phoneNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserStats {
    totalEvents: number;
    totalHours: number;
    completionRate: number;
}

@Injectable()
export class UserServiceClient {
    private readonly logger = new Logger(UserServiceClient.name);
    private readonly axiosInstance: AxiosInstance;

    constructor(private configService: ConfigService) {
        const baseURL = configService.get<string>('USER_SERVICE_URL') || 'http://localhost:8000/users';
        this.axiosInstance = axios.create({ baseURL });
    }

    private handleError(err: any): never {
        this.logger.error(err?.response?.data || err.message || err);
        throw new HttpException('Service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }

    /**
     * Lấy thông tin user profile
     */
    async getUserProfile(userId: string): Promise<UserProfile> {
        try {
            const res = await this.axiosInstance.get<UserProfile>(`/${userId}`);
            if (!res.data) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            return res.data;
        } catch (err) {
            this.handleError(err);
        }
    }

    /**
     * Lấy danh sách users theo role
     */
    async getUsersByRole(role: string): Promise<UserProfile[]> {
        try {
            const res = await this.axiosInstance.get<UserProfile[]>(`?role=${role}`);
            return res.data || [];
        } catch (err) {
            this.handleError(err);
        }
    }

    /**
     * Lấy skills của user
     */
    async getUserSkills(userId: string): Promise<string[]> {
        const profile = await this.getUserProfile(userId);
        return profile?.skills || [];
    }

    /**
     * Lấy interests của user
     */
    async getUserInterests(userId: string): Promise<string[]> {
        const profile = await this.getUserProfile(userId);
        return profile?.interests || [];
    }

    /**
     * Lấy thống kê user
     */
    async getUserStats(userId: string): Promise<UserStats> {
        try {
            const res = await this.axiosInstance.get<UserStats>(`/${userId}/stats`);
            return res.data || { totalEvents: 0, totalHours: 0, completionRate: 0 };
        } catch (err) {
            this.handleError(err);
        }
    }

    /**
     * Tìm kiếm users
     */
    async searchUsers(query: string): Promise<UserProfile[]> {
        try {
            const res = await this.axiosInstance.get<UserProfile[]>(`/search?q=${query}`);
            return res.data || [];
        } catch (err) {
            this.handleError(err);
        }
    }
}
