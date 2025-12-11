import { NotificationType } from "src/notification/domain/entities/notification-type.enum";

export interface NotificationMessage {
  type: NotificationType;
  userId: string;
  channels: {
    inApp?: boolean;
    email?: string;
    push?: string;
  };
  data: Record<string, any>;
}
