import React, { useEffect, useState, useCallback } from "react";
import {
    FaUsers, FaSignOutAlt, FaClipboardList, FaCalendarAlt,
    FaMapMarkerAlt, FaLayerGroup, FaChartBar, FaComments, FaArrowRight
} from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const COLORS = {
    PRIMARY: '#1A73E8', 
    DARK_NAVY: '#202124', 
    BACKGROUND: '#F8F9FA', // Màu nền sáng hơn một chút
    CARD_BG: '#FFFFFF', 
    BORDER: '#DADCE0', 
    TEXT_MAIN: '#3C4043',
    TEXT_SECONDARY: '#5F6368', 
    DANGER: '#D93025', 
    SUCCESS_ACCENT: '#188038', 
    WHITE: '#FFFFFF',
    SIDEBAR_BG: '#FFFFFF', 
    SIDEBAR_BORDER: '#DADCE0', 
};

interface EventItem {
    id: string;
    title: string;
    categoryName: string;
    status: string;
    location: { city: string; district: string };
    schedule: { startDate: string };
    capacity: { maxVolunteers: number; currentVolunteers: number };
}

const DienDan: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) { navigate("/manager/login"); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
            const result = await res.json();
            if (result.success) {
                const userData = result.data;
                userData.avatar = userData.avatar ? (userData.avatar.startsWith('http') ? userData.avatar : `${API_BASE_URL}${userData.avatar}`) : `https://ui-avatars.com/api/?name=${userData.username}&background=random`;
                setUser(userData);
            }
        } catch (err) { console.error(err); }
    }, [navigate]);

    const fetchPublishedEvents = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/events/my/list`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            const result = await res.json();
            if (result.success) {
                const publishedOnly = result.data.filter((e: EventItem) => e.status.toLowerCase() === 'published');
                setEvents(publishedOnly);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchUserProfile();
        fetchPublishedEvents();
    }, [fetchUserProfile, fetchPublishedEvents]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/manager/login");
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: COLORS.BACKGROUND }}>
            
            {/* SIDEBAR */}
            <aside style={styles.sidebar}>
                <div style={{ padding: '30px 24px', borderBottom: `1px solid ${COLORS.SIDEBAR_BORDER}` }}>
                    <h1 style={{ fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: COLORS.DARK_NAVY }}>
                        <FaUsers color={COLORS.PRIMARY} /> Manager
                    </h1>
                </div>
                <nav style={{ flex: 1, padding: '20px 12px' }}> 
                    <div onClick={() => navigate("/manager/statistics")} style={styles.navItem}>
                        <FaChartBar style={{ marginRight: '12px' }} /> Statistics
                    </div>
                    <div onClick={() => navigate("/manager/pending-applications")} style={styles.navItem}>
                        <FaClipboardList style={{ marginRight: '12px' }} /> Pending Applications
                    </div>
                    <div onClick={() => navigate("/manager/my-events")} style={styles.navItem}>
                        <FaLayerGroup style={{ marginRight: '12px' }} /> My Events
                    </div>
                    <div onClick={() => navigate("/manager/communication")} style={{ ...styles.navItem, backgroundColor: 'rgba(26, 115, 232, 0.1)', color: COLORS.PRIMARY }}>
                        <FaComments style={{ marginRight: '12px' }} /> Communications
                    </div>
                </nav>
                <div style={{ padding: '20px', borderTop: `1px solid ${COLORS.SIDEBAR_BORDER}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <img src={user?.avatar || ''} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} alt="avatar" />
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{user?.username}</div>
                            <div style={{ fontSize: '11px', color: COLORS.TEXT_SECONDARY }}>Organizer</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={styles.logoutBtn}><FaSignOutAlt /> Logout</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main style={{ marginLeft: '280px', flex: 1, padding: '40px', boxSizing: 'border-box' }}>
                <header style={{ marginBottom: '40px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', color: COLORS.DARK_NAVY, fontWeight: '700' }}>Communication Hub</h1>
                    <p style={{ margin: '8px 0 0', color: COLORS.TEXT_SECONDARY, fontSize: '16px' }}>
                        Select an event to start a conversation with your volunteers.
                    </p>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: COLORS.TEXT_SECONDARY }}>Loading your events...</div>
                ) : events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px', backgroundColor: '#fff', borderRadius: '16px' }}>
                        <FaComments size={48} color={COLORS.BORDER} style={{ marginBottom: '16px' }} />
                        <p style={{ color: COLORS.TEXT_SECONDARY }}>No published events available for communication.</p>
                    </div>
                ) : (
                    <div style={styles.eventGrid}>
                        {events.map(event => (
                            <div 
                                key={event.id} 
                                style={styles.eventCard}
                                onClick={() => navigate(`/manager/communication/${event.id}`)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                }}
                            >
                                <div style={styles.cardHeader}>
                                    <span style={styles.categoryBadge}>{event.categoryName}</span>
                                    <span style={styles.statusDot}>PUBLISHED</span>
                                </div>

                                <h3 style={styles.eventTitle}>{event.title}</h3>

                                <div style={styles.infoRow}>
                                    <FaMapMarkerAlt size={14} color={COLORS.PRIMARY} />
                                    <span>{event.location.district}, {event.location.city}</span>
                                </div>

                                <div style={styles.infoRow}>
                                    <FaCalendarAlt size={14} color={COLORS.PRIMARY} />
                                    <span>{new Date(event.schedule.startDate).toLocaleDateString('vi-VN')}</span>
                                </div>

                                <div style={styles.progressContainer}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                                        <span style={{ fontWeight: 'bold' }}>Volunteers</span>
                                        <span>{event.capacity.currentVolunteers}/{event.capacity.maxVolunteers}</span>
                                    </div>
                                    <div style={styles.progressBarBg}>
                                        <div style={{ 
                                            ...styles.progressBarFill, 
                                            width: `${Math.min((event.capacity.currentVolunteers/event.capacity.maxVolunteers)*100, 100)}%` 
                                        }} />
                                    </div>
                                </div>

                                <div style={styles.cardFooter}>
                                    <span style={{ color: COLORS.PRIMARY, fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        Open Chat <FaArrowRight size={12} />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

const styles = {
    sidebar: { width: '280px', minWidth: '280px', backgroundColor: COLORS.SIDEBAR_BG, position: 'fixed', height: '100vh', borderRight: `1px solid ${COLORS.SIDEBAR_BORDER}`, display: 'flex', flexDirection: 'column', zIndex: 10 } as React.CSSProperties,
    navItem: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginBottom: '4px', transition: '0.2s', color: COLORS.TEXT_MAIN } as React.CSSProperties,
    logoutBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#FCE8E6', color: COLORS.DANGER, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' } as React.CSSProperties,
    
    eventGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
    } as React.CSSProperties,

    eventCard: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${COLORS.BORDER}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    } as React.CSSProperties,

    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    } as React.CSSProperties,

    categoryBadge: {
        padding: '4px 12px',
        backgroundColor: '#E8F0FE',
        color: COLORS.PRIMARY,
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
    } as React.CSSProperties,

    statusDot: {
        fontSize: '10px',
        fontWeight: 'bold',
        color: COLORS.SUCCESS_ACCENT,
        letterSpacing: '0.5px'
    } as React.CSSProperties,

    eventTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: COLORS.DARK_NAVY,
        margin: '0 0 16px 0',
        lineHeight: '1.4'
    } as React.CSSProperties,

    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        color: COLORS.TEXT_SECONDARY,
        marginBottom: '10px'
    } as React.CSSProperties,

    progressContainer: {
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: `1px solid ${COLORS.BORDER}`
    } as React.CSSProperties,

    progressBarBg: {
        width: '100%',
        height: '6px',
        backgroundColor: '#F1F3F4',
        borderRadius: '3px',
        overflow: 'hidden'
    } as React.CSSProperties,

    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.SUCCESS_ACCENT,
        borderRadius: '3px',
        transition: 'width 0.5s ease-out'
    } as React.CSSProperties,

    cardFooter: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'flex-end'
    } as React.CSSProperties
};

export default DienDan;