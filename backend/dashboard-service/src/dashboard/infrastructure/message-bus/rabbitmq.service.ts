import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: Connection;
  private channel: Channel;
  private readonly queueName = 'dashboard_updates';
  private readonly exchangeName = 'notification_exchange';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
    await this.setupQueue();
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
        this.logger.log('Connected to RabbitMQ');
      } catch (err) {
        this.logger.error('Failed to connect to RabbitMQ, retrying in 5s', err);
        await this.delay(5000);
      }
    }
  }

  private async setupQueue() {
    await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
    await this.channel.assertQueue(this.queueName, { durable: true });
    
    // Bind to multiple routing keys
    await this.channel.bindQueue(this.queueName, this.exchangeName, 'event.*');
    await this.channel.bindQueue(this.queueName, this.exchangeName, 'registration.*');
    await this.channel.bindQueue(this.queueName, this.exchangeName, 'communication.*');

    this.logger.log(`Queue "${this.queueName}" bound to exchange "${this.exchangeName}"`);
  }

  async consume(handler: (msg: any) => Promise) {
    if (!this.channel) throw new Error('RabbitMQ channel not ready');

    this.channel.prefetch(10);

    this.channel.consume(
      this.queueName,
      async (msg: any | null) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          this.logger.log(`Received message: ${content.type}`);

          await handler(content);
          this.channel.ack(msg);
        } catch (err) {
          this.logger.error(`Error processing message: ${err}`);
          this.channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}