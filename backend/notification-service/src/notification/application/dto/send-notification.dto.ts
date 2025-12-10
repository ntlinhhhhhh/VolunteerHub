import { IsEmail, IsEnum, IsString, IsObject, IsOptional } from 'class-validator';
import { NotificationType } from '../../domain/entities/notification-type.enum';
import { NotificationChannel } from '../../domain/entities/notification-channel.enum';

export class SendNotificationDto {
    @IsString()
    userId: string;

    @IsEmail()
    recipient: string;

    @IsEnum(NotificationType)
    type: NotificationType;

    @IsEnum(NotificationChannel)
    @IsOptional()
    channel?: NotificationChannel = NotificationChannel.EMAIL;

    @IsString()
    subject: string;

    @IsString()
    content: string;

    @IsObject()
    @IsOptional()
    data?: Record<string, any>; // metadata, optional
}
