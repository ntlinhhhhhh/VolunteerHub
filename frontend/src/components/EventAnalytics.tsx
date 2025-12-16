import React from 'react';
import { FaChartPie, FaTags } from 'react-icons/fa';
import { COLORS, EVENT_STATUS_COLORS } from './AdminDashboardStyles';

interface Props {
    eventStats: any;
}

const EventAnalytics: React.FC<Props> = ({ eventStats }) => {
    if (!eventStats) return null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: `1px solid ${COLORS.BORDER}` }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <FaChartPie color={COLORS.PRIMARY} /> Trạng thái sự kiện
                </h4>
                {Object.keys(eventStats.byStatus).map(status => (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: EVENT_STATUS_COLORS[status], marginRight: '10px' }} />
                        <span style={{ flex: 1, fontSize: '14px' }}>{status.replace('_', ' ')}</span>
                        <span style={{ fontWeight: '700' }}>{eventStats.byStatus[status]}</span>
                    </div>
                ))}
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: `1px solid ${COLORS.BORDER}` }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <FaTags color={COLORS.SECONDARY} /> Danh mục phổ biến
                </h4>
                {eventStats.popularCategories.slice(0, 5).map((cat: any, idx: number) => (
                    <div key={cat.categoryId} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ width: '24px', fontSize: '12px', color: COLORS.TEXT_SECONDARY }}>#{idx + 1}</span>
                        <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{cat.categoryName}</span>
                        <span style={{ color: COLORS.PRIMARY, fontSize: '14px' }}>{cat.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventAnalytics;