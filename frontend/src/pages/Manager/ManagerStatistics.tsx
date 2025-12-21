import React, { useEffect, useState, useCallback } from "react";
import { 
    FaClipboardList, FaLayerGroup, FaUsers, FaCheckCircle, 
    FaHourglassHalf, FaChartBar, FaSignOutAlt 
} from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const API_BASE_URL = "http://localhost:8000";

const COLORS = {
    PRIMARY: '#1A73E8', 
    DARK_NAVY: '#202124', 
    BACKGROUND: '#F1F3F4', 
    CARD_BG: '#FFFFFF', 
    BORDER: '#DADCE0', 
    TEXT_MAIN: '#3C4043',
    TEXT_SECONDARY: '#5F6368', 
    DANGER: '#D93025', 
    SUCCESS: '#188038', 
    WARNING: '#F9AB00',
    WHITE: '#FFFFFF',
    LIGHT_PRIMARY: '#E8F0FE', 
    SIDEBAR_BG: '#FFFFFF', 
    SIDEBAR_TEXT: '#3C4043', 
    SIDEBAR_BORDER: '#DADCE0', 
};

const ManagerStatistics: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) { navigate("/manager/login"); return; }

        try {
            const userRes = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await userRes.json();
            if (result.success) {
                const userData = result.data;
                userData.avatar = userData.avatar ? (userData.avatar.startsWith('http') ? userData.avatar : `${API_BASE_URL}${userData.avatar}`) : `https://ui-avatars.com/api/?name=${userData.username}&background=random`;
                setUser(userData);
            }

            // Fetch Events
            const eventRes = await fetch(`${API_BASE_URL}/events/my/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const eventData = await eventRes.json();
            if (eventData.success) setEvents(eventData.data);

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const stats = {
        total: events.length,
        published: events.filter(e => e.status === 'published').length,
        pending: events.filter(e => e.status === 'pending_approval').length,
        totalVolunteers: events.reduce((acc, curr) => acc + curr.capacity.currentVolunteers, 0),
        totalCapacity: events.reduce((acc, curr) => acc + curr.capacity.maxVolunteers, 0),
    };

    const chartData = events.map(e => ({
        name: e.title.length > 12 ? e.title.substring(0, 12) + '...' : e.title,
        current: e.capacity.currentVolunteers,
        fullTitle: e.title
    }));

    const handleLogout = () => {
        localStorage.clear();
        navigate("/manager/login");
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', backgroundColor: COLORS.BACKGROUND, minHeight: '100vh' }}>Loading Statistics...</div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: COLORS.BACKGROUND }}>
            
            {/* SIDEBAR (Đồng nhất hoàn toàn với My Events) */}
            <aside style={styles.sidebar}>
                <div style={{ padding: '30px 24px', borderBottom: `1px solid ${COLORS.SIDEBAR_BORDER}` }}>
                    <h1 style={{ fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: COLORS.DARK_NAVY }}>
                        <FaUsers color={COLORS.PRIMARY} /> Manager
                    </h1>
                </div>
                <nav style={{ flex: 1, padding: '20px 12px' }}> 
                    <div onClick={() => navigate("/manager/statistics")} 
                         style={{ ...styles.navItem, backgroundColor: 'rgba(26, 115, 232, 0.15)', color: COLORS.PRIMARY }}>
                        <FaChartBar style={{ marginRight: '12px' }} /> Statistics
                    </div>
                    <div onClick={() => navigate("/manager/pending-applications")} style={styles.navItem}>
                        <FaClipboardList style={{ marginRight: '12px' }} /> Pending Applications
                    </div>
                    <div onClick={() => navigate("/manager/my-events")} style={styles.navItem}>
                        <FaLayerGroup style={{ marginRight: '12px' }} /> My Events
                    </div>
                    <div onClick={() => navigate("/manager/communication")} style={styles.navItem}>
                        <FaLayerGroup style={{ marginRight: '12px' }} /> Communications
                    </div>
                </nav>
                <div style={{ padding: '20px', borderTop: `1px solid ${COLORS.SIDEBAR_BORDER}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <img src={user?.avatar || ''} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} alt="avatar" />
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: COLORS.TEXT_MAIN }}>{user?.username}</div>
                            <div style={{ fontSize: '11px', color: COLORS.TEXT_SECONDARY }}>Organizer</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={styles.logoutBtn}><FaSignOutAlt /> Logout</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main style={{ marginLeft: '280px', flex: 1, padding: '40px', boxSizing: 'border-box' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', color: COLORS.DARK_NAVY }}>Statistics</h1>
                    <p style={{ margin: '8px 0 0', color: COLORS.TEXT_SECONDARY }}> Tổng hợp dữ liệu</p>
                </header>

                {/* STAT CARDS */}
                <div style={styles.statsGrid}>
                    <StatCard icon={<FaLayerGroup />} label="Tổng sự kiện" value={stats.total} color="#E8F0FE" textColor={COLORS.PRIMARY} />
                    <StatCard icon={<FaCheckCircle />} label="Đang hiển thị" value={stats.published} color="#E6F4EA" textColor={COLORS.SUCCESS} />
                    <StatCard icon={<FaHourglassHalf />} label="Chờ duyệt" value={stats.pending} color="#FEF7E0" textColor={COLORS.WARNING} />
                    <StatCard icon={<FaUsers />} label="Tổng TNV" value={`${stats.totalVolunteers}/${stats.totalCapacity}`} color="#FCE8E6" textColor={COLORS.DANGER} />
                </div>

                {/* CHARTS SECTION */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '32px' }}>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Tình trạng lấp đầy TNV</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.BORDER} />
                                    <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} fontSize={11} />
                                    <Tooltip cursor={{fill: '#F8F9FA'}} />
                                    <Bar dataKey="current" fill={COLORS.PRIMARY} radius={[4, 4, 0, 0]} barSize={40} name="Tình nguyện viên" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Trạng thái (%)</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Published', value: stats.published },
                                            { name: 'Pending', value: stats.pending },
                                            { name: 'Others', value: Math.max(0, stats.total - stats.published - stats.pending) }
                                        ]}
                                        innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                                    >
                                        <Cell fill={COLORS.SUCCESS} />
                                        <Cell fill={COLORS.WARNING} />
                                        <Cell fill={COLORS.BORDER} />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION (Đồng nhất style My Events) */}
                <div style={{ ...styles.card, marginTop: '32px', padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: `1px solid ${COLORS.BORDER}` }}>
                        <span style={{ fontWeight: 'bold', color: COLORS.DARK_NAVY }}>Danh sách chi tiết sự kiện</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8F9FA' }}>
                                    <th style={styles.th}>Sự kiện</th>
                                    <th style={styles.th}>Danh mục</th>
                                    <th style={styles.th}>Tiến độ</th>
                                    <th style={styles.th}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(event => (
                                    <tr key={event.id} style={{ borderBottom: `1px solid ${COLORS.BORDER}` }}>
                                        <td style={styles.td}><strong>{event.title}</strong></td>
                                        <td style={styles.td}><span style={{color: COLORS.PRIMARY, fontSize: '12px'}}>{event.categoryName}</span></td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={styles.progressBar}>
                                                    <div style={{ 
                                                        ...styles.progressFill, 
                                                        width: `${(event.capacity.currentVolunteers / event.capacity.maxVolunteers) * 100}%` 
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: '500' }}>{event.capacity.currentVolunteers}/{event.capacity.maxVolunteers}</span>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ 
                                                ...styles.badge, 
                                                backgroundColor: getStatusBG(event.status),
                                                color: getStatusTextColor(event.status)
                                            }}>
                                                {event.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Sub-component Stat Card
const StatCard = ({ icon, label, value, color, textColor }: any) => (
    <div style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
        <div style={{ padding: '15px', borderRadius: '12px', backgroundColor: color, color: textColor, fontSize: '24px', display: 'flex' }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '14px', color: COLORS.TEXT_SECONDARY, marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.DARK_NAVY }}>{value}</div>
        </div>
    </div>
);

// Helpers cho Style
const getStatusBG = (status: string) => {
    if (status === 'published') return '#E6F4EA';
    if (status === 'pending_approval') return '#FEF7E0';
    if (status === 'cancelled' || status === 'rejected') return '#FCE8E6';
    return '#F1F3F4';
};

const getStatusTextColor = (status: string) => {
    if (status === 'published') return COLORS.SUCCESS;
    if (status === 'pending_approval') return COLORS.WARNING;
    if (status === 'cancelled' || status === 'rejected') return COLORS.DANGER;
    return COLORS.TEXT_SECONDARY;
};

const styles = {
    sidebar: { width: '280px', minWidth: '280px', backgroundColor: COLORS.SIDEBAR_BG, position: 'fixed', height: '100vh', borderRight: `1px solid ${COLORS.SIDEBAR_BORDER}`, display: 'flex', flexDirection: 'column', zIndex: 100 } as React.CSSProperties,
    navItem: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginBottom: '4px', transition: '0.2s' } as React.CSSProperties,
    logoutBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#FCE8E6', color: COLORS.DANGER, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' } as React.CSSProperties,
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
    card: { backgroundColor: COLORS.CARD_BG, borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', border: `1px solid ${COLORS.BORDER}`, padding: '24px' } as React.CSSProperties,
    cardTitle: { margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold', color: COLORS.DARK_NAVY },
    th: { padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: COLORS.TEXT_SECONDARY, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' } as React.CSSProperties,
    td: { padding: '20px 24px', fontSize: '14px', color: COLORS.TEXT_MAIN, verticalAlign: 'middle' } as React.CSSProperties,
    progressBar: { width: '80px', height: '6px', backgroundColor: '#EEE', borderRadius: '3px', overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: COLORS.SUCCESS, borderRadius: '3px' },
    badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' } as React.CSSProperties,
};

export default ManagerStatistics;