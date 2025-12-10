import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, ValidationError } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    dotenv.config();
    const app = await NestFactory.create(AppModule);

    app.enableCors({ origin: process.env.CORS_ORIGIN || '*' });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: (errors: ValidationError[]) => {
                console.error('Validation failed:', JSON.stringify(errors, null, 2));
                return new BadRequestException(errors);
            },
        }),
    );

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


    const port = parseInt(process.env.PORT || '4008', 10);
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
