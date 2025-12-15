import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import type { IExportService } from '../../domain/services/export.service.interface';
import { ExportDashboardDto, ExportDashboardResponseDto } from '../dto/export-dashboard.dto';

@Injectable()
export class ExportDashboardUseCase {
    private readonly logger = new Logger(ExportDashboardUseCase.name);

    constructor(
        @Inject('IExportService')
        private readonly exportService: IExportService
    ) { }

    async execute(dto: ExportDashboardDto): Promise<ExportDashboardResponseDto> {
        try {
            this.logger.log(`Exporting dashboard for user ${dto.userId}, role: ${dto.role}, format: ${dto.format}`);

            // Validate export format
            const validFormats = ['PDF', 'EXCEL', 'CSV'];
            if (!validFormats.includes(dto.format)) {
                throw new HttpException(
                    `Invalid export format. Supported formats: ${validFormats.join(', ')}`,
                    HttpStatus.BAD_REQUEST
                );
            }

            // Export dashboard based on role and format
            const { downloadUrl, expiresAt } = await this.exportService.exportDashboard(
                dto.userId,
                dto.role,
                dto.period,
                dto.format
            );

            if (!downloadUrl) {
                throw new HttpException(
                    'Failed to generate export file',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            this.logger.log(`Dashboard exported successfully for user ${dto.userId}, URL expires at ${expiresAt}`);

            return {
                success: true,
                downloadUrl,
                expiresAt,
                format: dto.format,
            };

        } catch (error) {
            this.logger.error(`Error exporting dashboard: ${error.message}`, error.stack);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                'Failed to export dashboard',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}