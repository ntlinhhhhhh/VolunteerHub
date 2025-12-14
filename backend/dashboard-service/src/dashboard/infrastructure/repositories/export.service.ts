import { Injectable } from '@nestjs/common';
import { IExportService } from 'src/dashboard/domain/services/export.service.interface';

@Injectable()
export class ExportService implements IExportService {
    async exportDashboard(userId: string, role: string, period: string, format: string) {
        // TODO: cài logic export (ví dụ tạo file CSV/Excel/JSON)
        return {
            downloadUrl: 'https://example.com/file.xlsx',
            expiresAt: new Date(Date.now() + 3600 * 1000) // 1 giờ
        };
    }
}
