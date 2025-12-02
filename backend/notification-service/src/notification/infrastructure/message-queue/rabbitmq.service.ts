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

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        await this.connect();
        await this.setupQueue();
    }

    /** Khi service tắt → đóng kết nối */
    async onModuleDestroy() {
        await this.channel?.close();
        await this.connection?.close();
    }

    /** KẾT NỐI RABBITMQ */
    private async connect() {
        try {
            const url = this.configService.get('RABBITMQ_URL', 'amqp://localhost:5672');

            this.logger.log(`Connecting to RabbitMQ: ${url}`);
            this.connection = await amqp.connect(url);

            this.channel = await this.connection.createChannel();
            this.logger.log('Connected to RabbitMQ');
        } catch (error) {
            this.logger.error('Failed to connect:', error);
            setTimeout(() => this.connect(), 5000);
        }
    }

    /** KHAI BÁO QUEUE */
    private async setupQueue() {
        await this.channel.assertQueue(this.queueName, {
            durable: true, // Giữ queue khi RabbitMQ restart
        });
        this.logger.log(`Queue "${this.queueName}" ready`);
    }

    /** HÀM DÙNG CHO CONSUMER LẮNG NGHE MESSAGE */
    async consume(handler: (msg: any) => Promise<void>) {
        this.channel.consume(
            this.queueName,
            async (msg) => {
                if (!msg) return;

                try {
                    const content = JSON.parse(msg.content.toString());
                    this.logger.log(`Received message: ${JSON.stringify(content)}`);

                    await handler(content); // Gọi qua Consumer xử lý
                    this.channel.ack(msg);  // Xác nhận xử lý OK
                } catch (error) {
                    this.logger.error('Error:', error);
                    this.channel.nack(msg, false, true); // Requeue
                }
            },
            { noAck: false }
        );
    }

    /** HÀM DÙNG ĐỂ GỬI THÔNG ĐIỆP (OPTIONAL) */
    async publishMessage(data: any) {
        const buffer = Buffer.from(JSON.stringify(data));
        this.channel.sendToQueue(this.queueName, buffer, { persistent: true });

        this.logger.log(`Published message to "${this.queueName}"`);
    }
}
