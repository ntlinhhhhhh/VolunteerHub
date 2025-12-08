import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './auth/presentation/filters/http-exception.filter';

async function bootstrap() {
    const logger = new Logger('AuthService');
    try {

        const app = await NestFactory.create(AppModule);
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        app.useGlobalFilters(new AllExceptionsFilter());

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

        const port = parseInt(process.env.PORT || '4000', 10);
        await app.listen(port);

        logger.log(`✅ Auth Service HTTP API: http://localhost:${port}/api`);
        logger.log(`✅ Auth Service Microservice (Redis) at ${redisHost}:${redisPort}`);
    } catch (error) {
        logger.error('❌ Failed to start Auth Service:', error.message);
        process.exit(1);
    }
}

bootstrap();
