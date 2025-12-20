import React from 'react';
import { FaClipboardList, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { COLORS } from '../../config/constants';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    username?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout, username }) => {
    return (
        <aside style={{
            width: '280px',
            backgroundColor: COLORS.CARD_BG,
            height: '100vh',
            position: 'fixed',
            left: isOpen ? '0' : '-280px',
            transition: 'left 0.3s ease',
            zIndex: 1050,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '2px 0 10px rgba(0,0,0,0.05)'
        }}>
            <div style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: COLORS.PRIMARY, margin: 0, fontSize: '22px' }}>Manager</h2>
                <button onClick={onClose} style={{ display: window.innerWidth < 1024 ? 'block' : 'none', border: 'none', background: 'none' }}>
                    <FaTimes size={20} color={COLORS.TEXT_SECONDARY} />
                </button>
            </div>
            <nav style={{ flex: 1, padding: '0 15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 15px', backgroundColor: COLORS.LIGHT_PRIMARY, color: COLORS.PRIMARY, borderRadius: '8px', fontWeight: 600 }}>
                    <FaClipboardList style={{ marginRight: '12px' }} /> Applications
                </div>
            </nav>
            <div style={{ padding: '20px', borderTop: `1px solid ${COLORS.BORDER}` }}>
                <button onClick={onLogout} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.DANGER}`, color: COLORS.DANGER, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaSignOutAlt style={{ marginRight: '8px' }} /> Log Out ({username})
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;