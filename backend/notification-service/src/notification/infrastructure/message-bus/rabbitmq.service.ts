import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Connection } from 'amqplib/lib/connection';
import { Channel } from 'amqplib/lib/channel';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQService.name);

    private connection?: Connection;
    private channel?: Channel;
    private isReady = false; // ⭐ QUAN TRỌNG

    private readonly queueName = 'notifications';
    private readonly exchangeName = 'notification_exchange';
    private readonly dlqName = `${this.queueName}_dlq`;
    private readonly maxRetries = 3;
    private readonly retryDelayMs = 5000;

    constructor(private configService: ConfigService) {}

    // ================= LIFECYCLE =================
    async onModuleInit() {
        await this.connect();
        await this.setupQueue();
        this.isReady = true; // ⭐ ĐÁNH DẤU READY
        this.logger.log('RabbitMQ is READY');
    }

    async onModuleDestroy() {
        await this.channel?.close();
        await this.connection?.close();
    }

    // ================= CONNECTION =================
    private async connect() {
        const url = this.configService.get(
            'RABBITMQ_URL',
            'amqp://rabbitmq:5672'
        );

        while (!this.connection) {
            try {
                this.logger.log(`Connecting to RabbitMQ: ${url}`);
                this.connection = await amqp.connect(url);
                this.channel = await this.connection.createChannel();
                this.logger.log('Connected to RabbitMQ');
            } catch (err) {
                this.logger.error(
                    'Failed to connect to RabbitMQ, retrying in 5s',
                    err,
                );
                await this.delay(5000);
            }
        }
    }

    // ================= SETUP =================
    private async setupQueue() {
        if (!this.channel) return;

        await this.channel.assertExchange(this.exchangeName, 'topic', {
            durable: true,
        });

        await this.channel.assertQueue(this.queueName, { durable: true });
        await this.channel.assertQueue(this.dlqName, { durable: true });

        const routingKeys = [
            'auth.*',
            'user.*',
            'event.*',
            'registration.*',
            'admin.*',
        ];

        for (const key of routingKeys) {
            await this.channel.bindQueue(
                this.queueName,
                this.exchangeName,
                key,
            );
        }

        this.logger.log(
            `Queue "${this.queueName}" bound to exchange "${this.exchangeName}"`,
        );
    }

    // ================= CONSUMER =================
    async consume(handler: (msg: any) => Promise<void>) {
        if (!this.isReady || !this.channel) {
            this.logger.warn('Consume skipped – RabbitMQ not ready');
            return;
        }

        this.channel.prefetch(5);

        await this.channel.consume(
            this.queueName,
            async (msg) => {
                if (!msg) return;

                const headers = msg.properties.headers || {};
                const retryCount = headers['x-retry'] || 0;

                try {
                    const content = JSON.parse(msg.content.toString());
                    this.logger.log(`Received message: ${JSON.stringify(content)}`);

                    await handler(content);
                    this.channel!.ack(msg);
                } catch (err) {
                    this.logger.error(`Error processing message`, err);

                    if (retryCount < this.maxRetries) {
                        setTimeout(() => {
                            this.channel!.sendToQueue(
                                this.queueName,
                                msg.content,
                                {
                                    headers: {
                                        ...headers,
                                        'x-retry': retryCount + 1,
                                    },
                                    persistent: true,
                                },
                            );
                            this.logger.warn(
                                `Retrying message (attempt ${
                                    retryCount + 1
                                })`,
                            );
                        }, this.retryDelayMs);

                        this.channel!.ack(msg);
                    } else {
                        await this.channel!.sendToQueue(
                            this.dlqName,
                            msg.content,
                            { headers, persistent: true },
                        );
                        this.channel!.ack(msg);
                        this.logger.error(
                            `Message moved to DLQ: ${this.dlqName}`,
                        );
                    }
                }
            },
            { noAck: false },
        );
    }

    // ================= PRODUCER =================
    async publishMessage(data: any, routingKey: string) {
        if (!this.isReady || !this.channel) {
            this.logger.warn(
                `Publish skipped (${routingKey}) – RabbitMQ not ready`,
            );
            return;
        }

        const buffer = Buffer.from(JSON.stringify(data));
        this.channel.publish(this.exchangeName, routingKey, buffer, {
            persistent: true,
        });

        this.logger.log(`Published message: ${routingKey}`);
    }

    private delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
