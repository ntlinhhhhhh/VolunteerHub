export const COLORS = {
    PRIMARY: '#1A73E8', 
    SECONDARY: '#4285F4', 
    DARK_NAVY: '#202124', 
    BACKGROUND: '#F8F9FA', 
    CARD_BG: '#FFFFFF',
    BORDER: '#EBEBEB', 
    SUCCESS_ACCENT: '#34A853', 
    DANGER: '#EA4335', 
    TEXT_SECONDARY: '#5F6368', 
    WHITE: '#FFFFFF',
    WARNING: '#F7B200', 
    INFO: '#4CB7A5',
};

export const EVENT_STATUS_COLORS: { [key: string]: string } = {
    'draft': COLORS.TEXT_SECONDARY,
    'pending_approval': COLORS.WARNING,
    'approved': COLORS.INFO,
    'published': COLORS.PRIMARY,
    'ongoing': COLORS.SECONDARY,
    'completed': COLORS.SUCCESS_ACCENT,
    'cancelled': COLORS.DANGER,
    'rejected': COLORS.DANGER,
};

export const styles: { [key: string]: React.CSSProperties } = {
    dashboardContainer: { display: 'flex', minHeight: '100vh', width: '100vw', fontFamily: 'Inter, Roboto, sans-serif', backgroundColor: COLORS.BACKGROUND },
    sidebar: { width: '240px', backgroundColor: COLORS.CARD_BG, borderRight: `1px solid ${COLORS.BORDER}`, flexShrink: 0, padding: '20px 0' },
    mainContent: { flexGrow: 1, padding: '30px 40px', overflowY: 'auto' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    mainTitle: { fontSize: '28px', fontWeight: '700', color: COLORS.DARK_NAVY, margin: 0 },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    dataCard: { backgroundColor: COLORS.CARD_BG, padding: '25px', borderRadius: '12px', border: `1px solid ${COLORS.BORDER}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    // Các style cho Table
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 8px', color: COLORS.TEXT_SECONDARY, borderBottom: `1px solid ${COLORS.BORDER}`, fontSize: '13px' },
    td: { padding: '16px 8px', borderBottom: `1px solid ${COLORS.BORDER}`, fontSize: '14px' },
    // Badge Styles
    badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }
};