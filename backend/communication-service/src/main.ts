import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { HttpExceptionFilter } from './communication/presentation/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

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
  logger.log(`CORS enabled for origin: ${corsOrigin}`);
}

bootstrap();