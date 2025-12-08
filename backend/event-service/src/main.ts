import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, ValidationError } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { EventCategorySeeder } from './event/infrastructure/database/seed/event-category.seed';

async function bootstrap() {
    dotenv.config();
    const app = await NestFactory.create(AppModule);

    const seeder = app.get(EventCategorySeeder);
    await seeder.seed();

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

    const port = parseInt(process.env.PORT || '4006', 10);
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
