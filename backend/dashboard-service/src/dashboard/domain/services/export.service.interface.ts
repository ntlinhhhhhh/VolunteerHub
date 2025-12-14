import { UserRole } from '../../domain/entities/volunteer-dashboard.entity';
import { MetricPeriod } from '../../domain/entities/shared/metrics.entity';

export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV';

export interface IExportService {
    exportDashboard(
        userId: string,
        role: string,
        period: string,
        format: string
    ): Promise<{ downloadUrl: string; expiresAt: Date }>;
}
