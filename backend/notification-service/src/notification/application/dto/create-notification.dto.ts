import { NotificationChannel } from '../../domain/entities/notification-channel.enum';
import { NotificationType } from '../../domain/entities/notification-type.enum';

export class CreateNotificationDto {
  userId: string;
  recipient: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  content: string;
  data?: Record<string, any>;
}
