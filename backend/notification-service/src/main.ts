// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { Logger, ValidationPipe } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { RabbitMQService } from './notification/infrastructure/message-bus/rabbitmq.service';
// import { getConnectionToken } from '@nestjs/mongoose';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// async function bootstrap() {
//     const logger = new Logger('Notification');
//     try {
//         const app = await NestFactory.create(AppModule);
//         app.useGlobalPipes(
//             new ValidationPipe({
//                 whitelist: true,
//                 forbidNonWhitelisted: true,
//                 transform: true,
//             }),
//         );

//         app.enableCors({
//             origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
//             credentials: true,
//         });

//         const redisHost = process.env.REDIS_HOST || 'redis';
//         const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

//         const microserviceOptions: MicroserviceOptions = {
//             transport: Transport.REDIS,
//             options: {
//                 host: redisHost,
//                 port: redisPort,
//                 retryAttempts: 5,
//                 retryDelay: 3000,
//             },
//         };
//         app.connectMicroservice(microserviceOptions);
//         await app.startAllMicroservices();

//         const port = parseInt(process.env.PORT || '4004', 10);
//         await app.listen(port);
//         logger.log(`✅ Auth Service HTTP API: http://localhost:${port}/api`);
//         logger.log(`✅ Auth Service Microservice (Redis) at ${redisHost}:${redisPort}`);
//     } catch (error) {
//         logger.error('❌ Failed to start Auth Service:', error.message);
//         process.exit(1);
//     }
// }

// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './notification/infrastructure/message-bus/rabbitmq.service';
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