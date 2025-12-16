import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Connection } from 'amqplib/lib/connection';
import { Channel } from 'amqplib/lib/channel';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: Connection;
  private channel: Channel;
  private readonly exchangeName = 'notification_exchange';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private async connect() {
    const url = this.configService.get('RABBITMQ_URL', 'amqp://localhost:5672');
    
    while (!this.connection) {
      try {
        this.logger.log(`Connecting to RabbitMQ: ${url}`);
        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createChannel();
        
        // Declare exchange
        await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
        
        this.logger.log(' Connected to RabbitMQ');
      } catch (err) {
        this.logger.error(' Failed to connect to RabbitMQ, retrying in 5s', err);
        await this.delay(5000);
      }
    }
  }

  async publishMessage(data: any, routingKey: string) {
    if (!this.channel) {
      this.logger.error('RabbitMQ channel not ready');
      return;
    }

    try {
      const buffer = Buffer.from(JSON.stringify(data));
      await this.channel.publish(this.exchangeName, routingKey, buffer, { 
        persistent: true 
      });
      this.logger.log(` Published message with routingKey: ${routingKey}`);
    } catch (error) {
      this.logger.error(` Failed to publish message: ${error.message}`);
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}