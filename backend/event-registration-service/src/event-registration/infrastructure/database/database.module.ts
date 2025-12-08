import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Registration, RegistrationSchema } from './schemas/registration.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        retryAttempts: 3,
        retryDelay: 1000,
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('✅ MongoDB connected');
          });
          connection.on('disconnected', () => {
            console.log('❌ MongoDB disconnected');
          });
          connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}