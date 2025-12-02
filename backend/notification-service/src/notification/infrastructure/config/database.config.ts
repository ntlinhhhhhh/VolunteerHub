import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): MongooseModuleOptions => ({
    uri: configService.get<string>('MONGO_URI') || 'mongodb://volunteer-mongo:27017/noyification-service'
});