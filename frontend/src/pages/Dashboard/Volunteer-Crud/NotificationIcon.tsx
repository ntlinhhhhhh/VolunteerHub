import React from 'react';
import { FaBell } from 'react-icons/fa';

interface NotificationIconProps {
    count: number; 
    onClick: () => void;
}

const COLORS = {
    DANGER: "#dc3545", 
    DARK_NAVY: "#202124", 
    WHITE: "#ffffff",
    BORDER: "#e9ecef",
    CARD_BG: "#ffffff",
};

const iconStyles: { [key: string]: React.CSSProperties } = {
    wrapper: {
        position: 'relative',
        cursor: 'pointer',
        display: 'inline-block',
        padding: '10px',
        backgroundColor: COLORS.CARD_BG,
        borderRadius: '50%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: `1px solid ${COLORS.BORDER}`,
        transition: 'all 0.2s',
        marginRight: '15px', 
    },
    icon: {
        fontSize: '20px',
        color: COLORS.DARK_NAVY,
        transition: 'color 0.2s',
    },
    badge: {
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        backgroundColor: COLORS.DANGER,
        color: COLORS.WHITE,
        borderRadius: '50%',
        padding: '2px 6px',
        fontSize: '10px',
        fontWeight: 'bold',
        minWidth: '20px',
        textAlign: 'center',
        boxShadow: '0 0 0 2px white', 
        lineHeight: '14px',
    },
};

const NotificationIcon: React.FC<NotificationIconProps> = ({ count, onClick }) => {
    return (
        <div style={iconStyles.wrapper} onClick={onClick}>
            <FaBell style={iconStyles.icon} />
            {count > 0 && <span style={iconStyles.badge}>{count}</span>}
        </div>
    );
};

export default NotificationIcon;