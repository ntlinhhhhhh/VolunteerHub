import React from 'react';
import { COLORS } from './AdminDashboardStyles';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
    <div style={{
        backgroundColor: COLORS.CARD_BG,
        padding: '20px',
        borderRadius: '12px',
        border: `1px solid ${COLORS.BORDER}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }}>
        <div>
            <p style={{ fontSize: '13px', color: COLORS.TEXT_SECONDARY, margin: '0 0 5px 0', fontWeight: '600' }}>{title}</p>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.DARK_NAVY, margin: 0 }}>{value}</h2>
        </div>
        <div style={{ backgroundColor: `${color}15`, padding: '12px', borderRadius: '12px' }}>
            <Icon size={24} color={color} />
        </div>
    </div>
);

export default StatCard;