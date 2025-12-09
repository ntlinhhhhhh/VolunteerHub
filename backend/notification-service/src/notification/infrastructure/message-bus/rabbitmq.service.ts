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
    private readonly queueName = 'notifications';
    private readonly exchangeName = 'notification_exchange';
    private readonly dlqName = `${this.queueName}_dlq`;
    private readonly maxRetries = 3;
    private readonly retryDelayMs = 5000;

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
        // Declare
        await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
        await this.channel.assertQueue(this.queueName, { durable: true });
        await this.channel.assertQueue(this.dlqName, { durable: true });
        await this.channel.bindQueue(this.queueName, this.exchangeName, 'auth.*');
        await this.channel.bindQueue(this.queueName, this.exchangeName, 'user.*');
        await this.channel.bindQueue(this.queueName, this.exchangeName, 'event.*');
        await this.channel.bindQueue(this.queueName, this.exchangeName, 'registration.*');
        await this.channel.bindQueue(this.queueName, this.exchangeName, 'admin.*');

        this.logger.log(`Queue "${this.queueName}" bound to exchange "${this.exchangeName}" with user.* & event.*`);
    }

    async consume(handler: (msg: any) => Promise<void>) {
        if (!this.channel) throw new Error('RabbitMQ channel not ready');

        this.channel.prefetch(5);

        this.channel.consume(
            this.queueName,
            async (msg: any | null) => {
                if (!msg) return;

                const headers = msg.properties.headers || {};
                const retryCount = headers['x-retry'] || 0;

                try {
                    const content = JSON.parse(msg.content.toString());
                    this.logger.log(`Received message: ${JSON.stringify(content)}`);

                    await handler(content);

                    this.channel.ack(msg); // success
                } catch (err) {
                    this.logger.error(`Error processing message: ${err}`);

                    if (retryCount < this.maxRetries) {
                        // Delay retry
                        setTimeout(() => {
                            this.channel.sendToQueue(this.queueName, msg.content, {
                                headers: { ...headers, 'x-retry': retryCount + 1 },
                                persistent: true,
                            });
                            this.logger.warn(`Retrying message (attempt ${retryCount + 1})`);
                        }, this.retryDelayMs);

                        this.channel.ack(msg); // ack
                    } else {
                        // retry --> DLQ
                        await this.channel.sendToQueue(this.dlqName, msg.content, { headers, persistent: true });
                        this.channel.ack(msg);
                        this.logger.error(`Message moved to DLQ: ${this.dlqName}`);
                    }
                }
            },
            { noAck: false }
        );
    }

    async publishMessage(data: any, routingKey = 'user.registered') {
        const buffer = Buffer.from(JSON.stringify(data));
        this.channel.publish(this.exchangeName, routingKey, buffer, { persistent: true });
        this.logger.log(`Published message to "${this.queueName}" with routingKey "${routingKey}"`);
    }

    private delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
