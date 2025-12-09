// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe, BadRequestException, ValidationError, Logger } from '@nestjs/common';
// import * as dotenv from 'dotenv';
// import { EventCategorySeeder } from './event/infrastructure/database/seed/event-category.seed';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// async function bootstrap() {
//     dotenv.config();
//     const logger = new Logger('EventService');

//     const app = await NestFactory.create(AppModule);

//     // const seeder = app.get(EventCategorySeeder);
//     // await seeder.seed();

//     app.enableCors({ origin: process.env.CORS_ORIGIN || '*' });

//     app.useGlobalPipes(
//         new ValidationPipe({
//             whitelist: true,
//             forbidNonWhitelisted: true,
//             transform: true,
//             exceptionFactory: (errors: ValidationError[]) => {
//                 console.error('Validation failed:', JSON.stringify(errors, null, 2));
//                 return new BadRequestException(errors);
//             },
//         }),
//     );

//     const redisHost = process.env.REDIS_HOST || 'redis';
//     const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);


//     const microserviceOptions: MicroserviceOptions = {
//         transport: Transport.REDIS,
//         options: {
//             host: redisHost,
//             port: redisPort,
//             retryAttempts: 5,
//             retryDelay: 3000,
//         },
//     };
//     app.connectMicroservice(microserviceOptions);
//     await app.startAllMicroservices();


//     const port = parseInt(process.env.PORT || '4006', 10);
//     await app.listen(port);
//     console.log(`Application is running on: http://localhost:${port}`);
// }

// bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, BadRequestException, ValidationError } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { AllExceptionsFilter } from './event/presentation/filters/http-exception.filter';

async function bootstrap() {
    dotenv.config();
    const logger = new Logger('UserService');

    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: (errors: ValidationError[]) => {
                const detailedErrors = errors.map(err => ({
                    property: err.property,
                    value: err.value,
                    constraints: err.constraints,
                    children: err.children,
                }));
                logger.error('Validation failed:', JSON.stringify(detailedErrors, null, 2));
                return new BadRequestException(detailedErrors);
            },
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

    const port = parseInt(process.env.PORT || '4006', 10);
    await app.listen(port);

    logger.log(`✅ User Service HTTP API running at http://localhost:${port}/api`);
    logger.log(`✅ User Service Microservice (Redis) connected at ${redisHost}:${redisPort}`);
}

bootstrap();
