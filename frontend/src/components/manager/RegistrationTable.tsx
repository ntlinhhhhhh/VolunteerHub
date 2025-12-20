import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import type { Registration } from '../../types/manager.types';
import { COLORS } from '../../config/constants';

interface TableProps {
    data: Registration[];
    onAction: (id: string, action: 'accept' | 'reject') => void;
    onViewDetails: (id: string) => void;
    loading: boolean;
}

const RegistrationTable: React.FC<TableProps> = ({ data, onAction, onViewDetails, loading }) => {
    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading applications...</div>;

    return (
        <div style={{ backgroundColor: COLORS.CARD_BG, borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#F8F9FA', borderBottom: `1px solid ${COLORS.BORDER}` }}>
                        <th style={cellStyle}>Volunteer</th>
                        <th style={cellStyle}>Event & Role</th>
                        <th style={cellStyle}>Status</th>
                        <th style={cellStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(reg => (
                        <tr key={reg.id} style={{ borderBottom: `1px solid ${COLORS.BORDER}` }}>
                            <td style={cellStyle}>
                                <strong>{reg.volunteerName}</strong>
                                <div style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY }}>{reg.volunteerEmail}</div>
                            </td>
                            <td style={cellStyle}>
                                <div>{reg.eventTitle}</div>
                                <div style={{ fontSize: '12px', color: COLORS.PRIMARY }}>{reg.roleName}</div>
                            </td>
                            <td style={cellStyle}>
                                <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', backgroundColor: COLORS.LIGHT_PRIMARY, color: COLORS.PRIMARY }}>
                                    {reg.status.toUpperCase()}
                                </span>
                            </td>
                            <td style={cellStyle}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <FaEye color={COLORS.TEXT_SECONDARY} style={{ cursor: 'pointer' }} onClick={() => onViewDetails(reg.id)} />
                                    <FaCheckCircle color={COLORS.SUCCESS} style={{ cursor: 'pointer' }} onClick={() => onAction(reg.id, 'accept')} />
                                    <FaTimesCircle color={COLORS.DANGER} style={{ cursor: 'pointer' }} onClick={() => onAction(reg.id, 'reject')} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const cellStyle = { padding: '16px' };
export default RegistrationTable;