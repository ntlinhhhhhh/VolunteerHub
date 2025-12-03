// // auth-service/src/infrastructure/rabbitmq/rabbitmq.publisher.service.ts
// import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as amqp from 'amqplib';

// @Injectable()
// export class RabbitMQPublisherService implements OnModuleInit, OnModuleDestroy {
//   private readonly logger = new Logger(RabbitMQPublisherService.name);
//   private connection: amqp.Connection;
//   private channel: amqp.Channel;
//   private readonly exchange = 'notification_exchange';

//   constructor(private configService: ConfigService) {}

//   async onModuleInit() {
//     await this.connect();
//     await this.setupExchange();
//   }

//   async onModuleDestroy() {
//     await this.channel?.close();
//     await this.connection?.close();
//   }

//   private async connect() {
//     const url = this.configService.get('RABBITMQ_URL', 'amqp://localhost:5672');
//     this.connection = await amqp.connect(url);
//     this.channel = await this.connection.createChannel();
//   }

//   private async setupExchange() {
//     await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
//   }

//   async publish(routingKey: string, message: any) {
//     const buffer = Buffer.from(JSON.stringify(message));
//     this.channel.publish(this.exchange, routingKey, buffer, { persistent: true });
//     this.logger.log(`Published ${routingKey} -> ${this.exchange}`);
//   }
// }
