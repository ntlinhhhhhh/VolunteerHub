import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, ValidationError } from '@nestjs/common';
import * as dotenv from 'dotenv';

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

    const port = parseInt(process.env.PORT || '4008', 10);
    await app.listen(port);
    console.log(` Communication Service is running on: http://localhost:${port}`);
}

bootstrap();