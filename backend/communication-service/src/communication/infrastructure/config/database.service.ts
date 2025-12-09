import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
    private readonly logger = new Logger(DatabaseService.name);

    constructor(@InjectConnection() private readonly connection: Connection) {}

    onModuleInit() {
        this.connection.on('connected', () => {
            this.logger.log('MongoDB connected successfully');
        });
        this.connection.on('error', (err) => {
            this.logger.error('MongoDB connection error: ' + err.message);
        });
    }
}