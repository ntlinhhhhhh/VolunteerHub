import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { HttpExceptionFilter } from './communication/presentation/filters/http-exception.filter';
import * as express from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    try {

        const app = await NestFactory.create(AppModule);
        app.use('/uploads', express.static('/app/uploads'));

        const configService = app.get(ConfigService);

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );


        // Global exception filter
        app.useGlobalFilters(new HttpExceptionFilter());

        // Enable CORS
        app.enableCors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
        });



        const redisHost = process.env.REDIS_HOST || 'redis';
        const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

        const microserviceOptions: MicroserviceOptions = {
            transport: Transport.REDIS,
            options: {
                host: redisHost,
                port: redisPort,
                retryAttempts: 5,
                retryDelay: 3000,
            },
        };

        app.connectMicroservice(microserviceOptions);
        await app.startAllMicroservices();

        // Port
        const port = configService.get<number>('PORT') || 4010;

        // Check MongoDB connection
        try {
            const mongooseConnection = app.get(getConnectionToken());
            if (mongooseConnection.readyState === 1) {
                logger.log('Connected to MongoDB successfully');
            } else {
                logger.warn('MongoDB connection not ready');
            }
        } catch (error) {
            logger.error('Failed to connect to MongoDB', error);
        }

        await app.listen(port);
        logger.log(`Communication Service running on port ${port}`);

    } catch (error) {
        logger.error('❌ Failed to start Auth Service:', error.message);
        process.exit(1);
    }
}

bootstrap();