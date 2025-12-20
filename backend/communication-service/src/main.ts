import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { HttpExceptionFilter } from './communication/presentation/filters/http-exception.filter';
import * as express from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    try {
        const app = await NestFactory.create(AppModule);
        const configService = app.get(ConfigService);

        app.use('/uploads', express.static('/app/uploads'));

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        app.useGlobalFilters(new HttpExceptionFilter());

        const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:5173';
        app.enableCors({
            origin: corsOrigin,
            credentials: true,
        });

        const redisHost = configService.get<string>('REDIS_HOST') || 'redis';
        const redisPort = configService.get<number>('REDIS_PORT') || 6379;

        app.connectMicroservice<MicroserviceOptions>({
            transport: Transport.REDIS,
            options: {
                host: redisHost,
                port: redisPort,
                retryAttempts: 5,
                retryDelay: 3000,
            },
        });

        await app.startAllMicroservices();
        logger.log('📡 Communication Microservice connected to Redis');

        try {
            const mongooseConnection = app.get(getConnectionToken());
            if (mongooseConnection.readyState === 1) {
                logger.log('✅ Connected to MongoDB successfully');
            }
        } catch (dbError) {
            logger.warn('⚠️ MongoDB check skipped or failed');
        }

        const port = configService.get<number>('PORT') || 4010;
        await app.listen(port);
        
        logger.log(`🚀 Communication Service is running on: http://localhost:${port}`);
        logger.log(`🔗 CORS enabled for origin: ${corsOrigin}`);

    } catch (error) {
        logger.error('❌ Failed to start Communication Service:', error.stack);
        process.exit(1);
    }
}

bootstrap();