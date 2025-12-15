
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserServiceClient } from './clients/user-service.client';
import { EventServiceClient } from './clients/event-service.client';
import { RegistrationServiceClient } from './clients/registration-service.client';
import { NotificationServiceClient } from './clients/notification-service.client';
import { CommunicationServiceClient } from './clients/communication-service.client';
import { AuthServiceClient } from './clients/auth-service.client';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        UserServiceClient,
        EventServiceClient,
        RegistrationServiceClient,
        NotificationServiceClient,
        CommunicationServiceClient,
        AuthServiceClient,
    ],
    exports: [
        UserServiceClient,
        EventServiceClient,
        RegistrationServiceClient,
        NotificationServiceClient,
        CommunicationServiceClient,
        AuthServiceClient,
    ],
})
export class HttpClientsModule {}