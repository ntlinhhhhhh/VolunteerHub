import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './presentation/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    app.useGlobalFilters(new AllExceptionsFilter());
    app.enableCors({ origin: process.env.CORS_ORIGIN || '*', credentials: true });

    const microserviceOptions: MicroserviceOptions = {
      transport: Transport.TCP,
      options: {
        host: process.env.TCP_HOST || '0.0.0.0',
        port: parseInt(process.env.TCP_PORT || '4001', 10),
      },
    };

    app.connectMicroservice(microserviceOptions);
    await app.startAllMicroservices();
    
    const port = parseInt(process.env.PORT || '4000', 10);
    await app.listen(port);

    logger.log(`✅ Auth Service running on: http://localhost:${port}/api`);
    logger.log(`✅ Microservice (TCP) running on port: ${process.env.TCP_PORT || 4001}`);
    logger.log(`✅ MongoDB connected successfully!`);
  } catch (error) {
    logger.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
}

bootstrap();