import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaChevronRight, FaUserCircle, FaMapMarkerAlt, FaCalendarCheck } from 'react-icons/fa';

const COLORS = {
    bgCard: '#ffffff',
    bgDark: '#0f172a',
    border: '#f1f5f9',
    textMain: '#1e293b',
    textMuted: '#64748b',
    primary: '#6366f1',
    accent: '#10b981',
    warning: '#f59e0b',
    warningLight: '#fffbeb',
    fontFamily: "Roboto, Arial, sans-serif", 
};

interface DashboardStatsProps {
    totalUsers: number;
    eventStats: {
        totalEvents: number;
        byStatus: { [key: string]: number };
        upcomingEvents: number;
        pendingEventsList?: any[]; 
    } | null;
    loading: boolean;
}

const AdminDashboardStats: React.FC<DashboardStatsProps> = ({ totalUsers, eventStats, loading }) => {
    const navigate = useNavigate();
    
    const pendingCount = eventStats?.byStatus?.['pending_approval'] || 0;
    const realPendingEvents = eventStats?.pendingEventsList || [];
    const [pendingEvents, setPendingEvents] = React.useState<any[]>([]);
    const [loadingPending, setLoadingPending] = React.useState(true);

    React.useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await fetch(
                    'http://localhost:8000/events/?status=pending_approval'
                );
                const json = await res.json();

                if (json.success) {
                    setPendingEvents(json.data || []);
                }
            } catch (err) {
                console.error('Fetch pending events failed', err);
            } finally {
                setLoadingPending(false);
            }
        };

        fetchPending();
    }, []);


    if (loading) return <div style={{...styles.loading, fontFamily: COLORS.fontFamily}}>Đang tải dữ liệu hệ thống...</div>;

    return (
        <div style={{...styles.mainWrapper, fontFamily: 'sans-serif'}}>
            <div style={styles.leftCol}>
                
                {/* 1. Card Tổng quan người dùng */}
                <div style={styles.glassCard}>
                    <div style={styles.cardHeader}>
                        {/* Font Roboto áp dụng tại đây */}
                        <p style={{ ...styles.miniTitle, fontFamily: COLORS.fontFamily}}>TĂNG TRƯỞNG NGƯỜI DÙNG</p>
                        <span style={styles.badgeSuccess}>Live</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <h2 style={styles.bigNumber}>{totalUsers.toLocaleString()}</h2>
                        <div style={{ width: '120px', height: '50px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[{v:10}, {v:25}, {v:15}, {v:45}, {v:30}, {v:55}]}>
                                    <Area type="monotone" dataKey="v" stroke={COLORS.primary} fill="url(#grad)" strokeWidth={2.5} />
                                    <defs>
                                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                                            <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div style={styles.glassCard}>
                    <div style={styles.cardHeader}>
                        <div>
                            <p style={{ ...styles.miniTitle, fontFamily: COLORS.fontFamily}}>CẦN PHÊ DUYỆT</p>
                            <span style={{ fontSize: '11px', color: COLORS.textMuted }}>
                                {pendingCount} sự kiện đang chờ xử lý
                            </span>
                        </div>
                        <button 
                            onClick={() => navigate('/admin/event-approvals')}
                            style={{...styles.viewAllBtn, fontFamily: COLORS.fontFamily}}
                        >
                            Xem tất cả <FaChevronRight size={10} />
                        </button>
                    </div>

                    <div style={styles.scrollWrapper}>
                        {loadingPending ? (
                            <div style={styles.emptyState}>Đang tải...</div>
                        ) : pendingEvents.length > 0 ? (
                            pendingEvents.map(event => (
                                <div
                                    key={event.id}
                                    style={styles.pendingItem}
                                    onClick={() => navigate('/admin/event-approvals')}
                                >
                                    <div style={styles.pendingIcon}>
                                        <FaClock size={16} color={COLORS.warning} />
                                    </div>

                                    <div style={styles.pendingBody}>
                                        <div style={styles.pTitle}>
                                            {event.title}
                                        </div>

                                        <div style={styles.pMetaRow}>
                                            <span style={styles.pMeta}>
                                                <FaUserCircle /> {event.organizerName}
                                            </span>
                                            <span style={styles.pMeta}>
                                                <FaMapMarkerAlt /> {event.location?.address}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={styles.pDate}>
                                        {new Date(event.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={styles.emptyState}>
                                🎉 Tất cả sự kiện đã được xử lý!
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* 3. Cột phải: Lịch */}
            <div style={styles.rightCol}>
                <div style={styles.calendarCard}>
                    <div style={styles.calHeader}>
                        <div>
                            <p style={{...styles.calTitle, fontFamily: COLORS.fontFamily}}>HÔM NAY</p>
                            <h3 style={styles.calDate}>
                                {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' })}
                            </h3>
                        </div>
                        <div style={styles.calBadge}>
                            <FaCalendarCheck /> {eventStats?.upcomingEvents || 0}
                        </div>
                    </div>

                    <div style={styles.calendarGrid}>
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                            <span key={d} style={styles.dayName}>{d}</span>
                        ))}
                        {[...Array(31)].map((_, i) => {
                            const isToday = (i + 1) === new Date().getDate();
                            return (
                                <div key={i} style={{
                                    ...styles.dayNum,
                                    backgroundColor: isToday ? COLORS.primary : 'rgba(255,255,255,0.03)',
                                    color: isToday ? '#fff' : '#cbd5e1',
                                    border: isToday ? `2px solid rgba(255,255,255,0.2)` : '1px solid transparent'
                                }}>
                                    {i + 1}
                                </div>
                            );
                        })}
                    </div>
                    
                    <button 
                        style={{...styles.actionBtn, fontFamily: COLORS.fontFamily}}
                        onClick={() => navigate('/admin/event-approvals')}
                    >
                        Quản lý phê duyệt
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    mainWrapper: { display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%', padding: '10px' },
    leftCol: { flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '20px' },
    rightCol: { flex: '0 1 320px', minWidth: '300px' },
    glassCard: { 
        backgroundColor: COLORS.bgCard, borderRadius: '24px', padding: '24px', 
        border: `1px solid ${COLORS.border}`, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' 
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
    miniTitle: { fontSize: '12px', fontWeight: 700, color: COLORS.textMuted, letterSpacing: '0.5px', margin: 0 },
    bigNumber: { fontSize: '36px', fontWeight: 800, color: COLORS.textMain, margin: 0 },
    badgeSuccess: { fontSize: '11px', padding: '4px 10px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: COLORS.accent, fontWeight: 700 },
    scrollWrapper: { maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' },
    pendingList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    pendingItem: { 
        display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 16px',
        borderRadius: '18px', backgroundColor: '#f8fafc', cursor: 'pointer',
        transition: 'all 0.3s'
    },
    pendingIcon: { 
        width: '40px', height: '40px', borderRadius: '14px', 
        backgroundColor: COLORS.warningLight, display: 'flex', 
        alignItems: 'center', justifyContent: 'center' 
    },
    pendingBody: { flex: 1 },
    pTitle: { fontSize: '14px', fontWeight: 700, color: COLORS.textMain, marginBottom: '4px' },
    pMetaRow: { display: 'flex', gap: '12px' },
    pMeta: { fontSize: '10px', color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '4px' },
    pDate: { fontSize: '11px', fontWeight: 800, color: COLORS.primary },
    viewAllBtn: { background: 'none', border: 'none', color: COLORS.primary, fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
    emptyState: { textAlign: 'center', padding: '20px', fontSize: '13px', color: COLORS.textMuted },
    calendarCard: { 
        backgroundColor: COLORS.bgDark, borderRadius: '30px', padding: '24px', 
        color: '#fff', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)' 
    },
    calHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    calTitle: { fontSize: '11px', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px' },
    calDate: { fontSize: '20px', fontWeight: 700, margin: '4px 0 0 0' },
    calBadge: { backgroundColor: 'rgba(99, 102, 241, 0.2)', color: COLORS.primary, padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' },
    calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' },
    dayName: { fontSize: '10px', color: '#64748b', textAlign: 'center', fontWeight: 800, paddingBottom: '10px' },
    dayNum: { aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', borderRadius: '12px' },
    actionBtn: { width: '100%', marginTop: '24px', padding: '14px', borderRadius: '16px', border: 'none', backgroundColor: COLORS.primary, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' },
    loading: { padding: '60px', textAlign: 'center', color: COLORS.primary, fontWeight: 700 }
};

export default AdminDashboardStats;