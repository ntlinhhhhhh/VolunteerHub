// import { Controller, Get } from '@nestjs/common';
// import { Public } from '../../infrastructure/auth/public.decorator';
// import { ConfigService } from '@nestjs/config';

// @Controller('health')
// export class HealthController {
//   constructor(private readonly configService: ConfigService) {}

//   @Public()
//   @Get()
//   check() {
//     return {
//       status: 'ok',
//       service: 'event-service',
//       timestamp: new Date().toISOString(),
//       version: '1.0.0',
//       environment: this.configService.get('NODE_ENV'),
//     };
//   }

//   @Public()
//   @Get('ready')
//   ready() {
//     return {
//       status: 'ready',
//       mongodb: 'connected',
//       redis: 'connected',
//       rabbitmq: 'connected',
//     };
//   }

//   @Public()
//   @Get('live')
//   live() {
//     return {
//       status: 'alive',
//       uptime: process.uptime(),
//       memory: process.memoryUsage(),
//     };
//   }
// }