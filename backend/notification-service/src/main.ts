import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './notification/infrastructure/message-queue/rabbitmq.service';
import { getConnectionToken } from '@nestjs/mongoose';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Port
  const port = configService.get<number>('PORT') || 4004;

  // --- Kiểm tra kết nối MongoDB ---
  try {
    const mongooseConnection = app.get(getConnectionToken());
    if (mongooseConnection.readyState === 1) {
      logger.log('✅ Connected to MongoDB successfully');
    } else {
      logger.warn('⚠ MongoDB connection not ready');
    }
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB', error);
  }

  try {
    const rabbitService = app.get(RabbitMQService);
    await rabbitService.onModuleInit();
    logger.log('✅ Connected to RabbitMQ successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to RabbitMQ', error);
  }

  await app.listen(port);
  logger.log(`🚀 Notification Service running on port ${port}`);
}

bootstrap();
