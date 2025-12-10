import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { UpdateDashboardDataUseCase } from '../../application/use-cases/update-dashboard-data.use-case';
import { DashboardMessage } from '../../application/dto/dashboard-message.dto';

@Injectable()
export class DashboardConsumerService implements OnModuleInit {
  private readonly logger = new Logger(DashboardConsumerService.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly updateDashboardUseCase: UpdateDashboardDataUseCase
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.consume(this.handleMessage.bind(this));
  }

  private async handleMessage(message: DashboardMessage): Promise<void> {
    this.logger.log(`Processing dashboard update: ${message.type}`);

    try {
      await this.updateDashboardUseCase.execute(message);
    } catch (error) {
      this.logger.error(`Failed to process message: ${message.type}`, error);
      throw error;
    }
  }
}