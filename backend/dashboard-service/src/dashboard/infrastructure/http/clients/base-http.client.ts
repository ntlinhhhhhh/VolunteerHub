import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Base HTTP Client cho tất cả service clients
 * Xử lý common logic: retry, timeout, error handling, logging
 */
@Injectable()
export class BaseHttpClient {
    protected readonly logger: Logger;
    protected readonly axiosInstance: AxiosInstance;

    constructor(
        protected readonly configService: ConfigService,
        baseURL: string,
        serviceName: string
    ) {
        this.logger = new Logger(`${serviceName}Client`);

        this.axiosInstance = axios.create({
            baseURL,
            timeout: 10000, // 10 seconds
            headers: {
                'Content-Type': 'application/json',
                'X-Service-Name': 'dashboard-service'
            }
        });

        // Request interceptor
        this.axiosInstance.interceptors.request.use(
            (config) => {
                this.logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                this.logger.error('Request error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.axiosInstance.interceptors.response.use(
            (response) => {
                this.logger.debug(`← ${response.status} ${response.config.url}`);
                return response;
            },
            async (error) => {
                if (error.response) {
                    this.logger.error(
                        `HTTP Error: ${error.response.status} - ${error.response.data?.message || error.message}`
                    );
                } else if (error.request) {
                    this.logger.error('No response received:', error.message);
                } else {
                    this.logger.error('Request setup error:', error.message);
                }
                return Promise.reject(this.handleError(error));
            }
        );
    }

    protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.get<T>(url, config);
        return response.data;
    }

    protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.post<T>(url, data, config);
        return response.data;
    }

    protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.put<T>(url, data, config);
        return response.data;
    }

    protected async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.patch<T>(url, data, config);
        return response.data;
    }

    protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.delete<T>(url, config);
        return response.data;
    }

    private handleError(error: any): HttpException {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || error.message;
            
            switch (status) {
                case 404:
                    return new HttpException(message, HttpStatus.NOT_FOUND);
                case 400:
                    return new HttpException(message, HttpStatus.BAD_REQUEST);
                case 401:
                    return new HttpException(message, HttpStatus.UNAUTHORIZED);
                case 403:
                    return new HttpException(message, HttpStatus.FORBIDDEN);
                case 500:
                    return new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
                default:
                    return new HttpException(message, status);
            }
        }
        
        return new HttpException(
            'Service unavailable',
            HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    protected setAuthToken(token: string) {
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
}