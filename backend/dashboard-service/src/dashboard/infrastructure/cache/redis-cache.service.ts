import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ICacheService } from '../../domain/repositories/dashboard-cache.repository.interface';

@Injectable()
export class RedisCacheService implements ICacheService, OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisCacheService.name);
    private client: RedisClientType;
    private isConnected: boolean = false;
    private connectionPromise: Promise<void> | null = null;

    async onModuleInit() {
        await this.initializeRedis();
    }

    private async initializeRedis() {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = (async () => {
            try {
                this.client = createClient({
                    socket: {
                        host: process.env.REDIS_HOST || 'redis',
                        port: Number(process.env.REDIS_PORT || 6379),
                        reconnectStrategy: (retries) => {
                            if (retries > 10) return new Error('Redis reconnect failed');
                            return 1000;
                        },
                    },
                });

                this.client.on('error', (err) => {
                    this.logger.error('Redis Client Error:', err);
                    this.isConnected = false;
                });

                this.client.on('ready', () => {
                    this.logger.log('✅ Redis connected and ready');
                    this.isConnected = true;
                });

                this.client.on('reconnecting', () => {
                    this.logger.warn('⚠️ Redis reconnecting...');
                    this.isConnected = false;
                });

                await this.client.connect();
            } catch (error) {
                this.logger.error('Failed to initialize Redis:', error);
                this.isConnected = false;
                throw error;
            }
        })();

        return this.connectionPromise;
    }

    async get(key: string): Promise<string | null> {
        try {
            if (!this.isConnected) {
                this.logger.warn('Redis not connected, skipping cache read');
                return null;
            }
            return await this.client.get(key);
        } catch (error) {
            this.logger.error(`Error getting cache key ${key}:`, error);
            return null;
        }
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        try {
            if (!this.isConnected) {
                this.logger.warn('Redis not connected, skipping cache write');
                return;
            }

            if (ttl) {
                await this.client.setEx(key, ttl, value);
            } else {
                await this.client.set(key, value);
            }
        } catch (error) {
            this.logger.error(`Error setting cache key ${key}:`, error);
        }
    }

    async del(key: string): Promise<void> {
        try {
            if (!this.isConnected) return;
            await this.client.del(key);
        } catch (error) {
            this.logger.error(`Error deleting cache key ${key}:`, error);
        }
    }

    async deletePattern(pattern: string): Promise<void> {
        try {
            if (!this.isConnected) return;

            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
                this.logger.log(`Deleted ${keys.length} keys matching ${pattern}`);
            }
        } catch (error) {
            this.logger.error(`Error deleting pattern ${pattern}:`, error);
        }
    }

    async getTTL(key: string): Promise<number> {
        try {
            if (!this.isConnected) return -1;
            return await this.client.ttl(key);
        } catch (error) {
            this.logger.error(`Error getting TTL for ${key}:`, error);
            return -1;
        }
    }

    async onModuleDestroy() {
        if (this.client && this.isConnected) {
            await this.client.quit();
            this.logger.log('Redis connection closed');
        }
    }
}