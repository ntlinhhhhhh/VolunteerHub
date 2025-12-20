import React, { useEffect, useState, useCallback } from "react";
import {
    FaPlus, FaUsers, FaSignOutAlt, FaClipboardList, FaCalendarAlt,
    FaMapMarkerAlt, FaEdit, FaEye, FaFilter, FaLayerGroup, FaCheckCircle, FaTimesCircle,
    FaChartBar
} from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

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
    SUCCESS_ACCENT: '#188038', 
    WARNING: '#F9AB00',
    WHITE: '#FFFFFF',
    LIGHT_PRIMARY: '#E8F0FE', 
    SIDEBAR_BG: '#FFFFFF', 
    SIDEBAR_TEXT: '#3C4043', 
    SIDEBAR_BORDER: '#DADCE0', 
};

// --- INTERFACES ---
interface EventItem {
    id: string;
    title: string;
    categoryName: string;
    status: string;
    location: { city: string; district: string };
    schedule: { startDate: string };
    capacity: { maxVolunteers: number; currentVolunteers: number };
    createdAt: string;
}

const MyEvents: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(false);

    // --- LOGIC AUTH & API ---
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

    const fetchMyEvents = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/events/my/list`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            const result = await res.json();
            if (result.success) setEvents(result.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchUserProfile();
        fetchMyEvents();
    }, [fetchUserProfile, fetchMyEvents]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/manager/login");
    };

    // Hàm xử lý Publish hoặc Cancel
    const handleEventAction = async (eventId: string, action: 'publish' | 'cancel') => {
        const token = localStorage.getItem("accessToken");
        const confirmMsg = action === 'publish' ? "Bạn có chắc chắn muốn publish sự kiện này?" : "Bạn có chắc chắn muốn hủy sự kiện này?";
        
        if (!window.confirm(confirmMsg)) return;

        try {
            const body = action === 'cancel' ? JSON.stringify({ cancellationReason: "Organizer cancelled" }) : null;
            const res = await fetch(`${API_BASE_URL}/events/${eventId}/${action}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: body
            });
            const result = await res.json();
            if (result.success) {
                alert(result.message || `Event ${action}ed successfully`);
                fetchMyEvents(); // Refresh danh sách
            } else {
                alert(result.message || "Action failed");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred");
        }
    };

    // Helper: Màu sắc cho Badge trạng thái
    const getStatusStyle = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'published' || s === 'approved') return { bg: '#E6F4EA', color: COLORS.SUCCESS_ACCENT };
        if (s === 'draft') return { bg: '#F1F3F4', color: COLORS.TEXT_SECONDARY };
        if (s === 'pending_approval') return { bg: '#FEF7E0', color: COLORS.WARNING };
        if (s === 'rejected' || s === 'cancelled') return { bg: '#FCE8E6', color: COLORS.DANGER };
        return { bg: COLORS.LIGHT_PRIMARY, color: COLORS.PRIMARY };
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: COLORS.BACKGROUND }}>
            
            {/* SIDEBAR (Đồng nhất với Dashboard) */}
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
                    <div onClick={() => navigate("/manager/my-events")} style={{ ...styles.navItem, backgroundColor: 'rgba(26, 115, 232, 0.15)', color: COLORS.PRIMARY }}>
                        <FaLayerGroup style={{ marginRight: '12px' }} /> My Events
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
                <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px', color: COLORS.DARK_NAVY }}>My Events</h1>
                        <p style={{ margin: '8px 0 0', color: COLORS.TEXT_SECONDARY }}>Manage and track all events you have created.</p>
                    </div>
                    <button onClick={() => navigate("/manager/create-event")} style={styles.createBtn}>
                        <FaPlus /> Create Event
                    </button>
                </header>

                <div style={styles.card}>
                    <div style={{ padding: '20px', borderBottom: `1px solid ${COLORS.BORDER}`, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>Total Events ({events.length})</span>
                        <FaFilter color={COLORS.TEXT_SECONDARY} style={{ cursor: 'pointer' }} />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8F9FA' }}>
                                    <th style={styles.th}>Event Details</th>
                                    <th style={styles.th}>Location</th>
                                    <th style={styles.th}>Start Date</th>
                                    <th style={styles.th}>Volunteers</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading events...</td></tr>
                                ) : events.map(event => {
                                    const statusStyle = getStatusStyle(event.status);
                                    return (
                                        <tr key={event.id} style={{ borderBottom: `1px solid ${COLORS.BORDER}` }}>
                                            <td style={styles.td}>
                                                <div style={{ fontWeight: 'bold', color: COLORS.DARK_NAVY }}>{event.title}</div>
                                                <div style={{ fontSize: '12px', color: COLORS.PRIMARY }}>{event.categoryName}</div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <FaMapMarkerAlt size={12} color={COLORS.TEXT_SECONDARY} />
                                                    {event.location.district}, {event.location.city}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <FaCalendarAlt size={12} color={COLORS.TEXT_SECONDARY} />
                                                    {new Date(event.schedule.startDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ fontSize: '13px' }}>
                                                    <strong>{event.capacity.currentVolunteers}</strong> / {event.capacity.maxVolunteers}
                                                </div>
                                                <div style={{ width: '60px', height: '4px', backgroundColor: '#EEE', borderRadius: '2px', marginTop: '4px' }}>
                                                    <div style={{ width: `${(event.capacity.currentVolunteers/event.capacity.maxVolunteers)*100}%`, height: '100%', backgroundColor: COLORS.SUCCESS_ACCENT, borderRadius: '2px' }} />
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{ 
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                                                    backgroundColor: statusStyle.bg, color: statusStyle.color, textTransform: 'uppercase'
                                                }}>
                                                    {event.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ ...styles.td, textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    {/* <button title="View Details" style={styles.actionBtn}><FaEye /></button>
                                                     */}

                                                    <button 
                                                        title="View Details" 
                                                        onClick={() => navigate(`/manager/event-details/${event.id}`)} // Điều hướng đến trang chi tiết
                                                        style={styles.actionBtn}
                                                    >
                                                        <FaEye />
                                                    </button> 
                                                    {/* Nút Publish: Chỉ hiện khi trạng thái là approved */}
                                                    {event.status === 'approved' && (
                                                        <button 
                                                            onClick={() => handleEventAction(event.id, 'publish')}
                                                            title="Publish Event" 
                                                            style={{ ...styles.actionBtn, color: COLORS.SUCCESS_ACCENT, backgroundColor: '#E6F4EA' }}
                                                        >
                                                            <FaCheckCircle />
                                                        </button>
                                                    )}

                                                    {/* Nút Cancel: Chỉ hiện khi trạng thái là published */}
                                                    {event.status === 'published' && (
                                                        <button 
                                                            onClick={() => handleEventAction(event.id, 'cancel')}
                                                            title="Cancel Event" 
                                                            style={{ ...styles.actionBtn, color: COLORS.DANGER, backgroundColor: '#FCE8E6' }}
                                                        >
                                                            <FaTimesCircle />
                                                        </button>
                                                    )}

                                                    {event.status === 'draft' && (
                                                        <button 
                                                            onClick={() => navigate(`/manager/edit-event/${event.id}`)} 
                                                            title="Edit Draft" 
                                                            style={{ ...styles.actionBtn, color: COLORS.PRIMARY, backgroundColor: COLORS.LIGHT_PRIMARY }}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- STYLES ---
const styles = {
    sidebar: { width: '280px', minWidth: '280px', backgroundColor: COLORS.SIDEBAR_BG, color: COLORS.SIDEBAR_TEXT , position: 'fixed', height: '100vh', borderRight: `1px solid ${COLORS.SIDEBAR_BORDER}`, display: 'flex', flexDirection: 'column' } as React.CSSProperties,
    navItem: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginBottom: '4px', transition: '0.2s' } as React.CSSProperties,
    logoutBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#FCE8E6', color: COLORS.DANGER, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' } as React.CSSProperties,
    card: { backgroundColor: COLORS.CARD_BG, borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', border: `1px solid ${COLORS.BORDER}` } as React.CSSProperties,
    th: { padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: COLORS.TEXT_SECONDARY, fontWeight: 'bold', textTransform: 'uppercase' } as React.CSSProperties,
    td: { padding: '20px 24px', fontSize: '14px', color: COLORS.TEXT_MAIN, verticalAlign: 'middle' } as React.CSSProperties,
    createBtn: { padding: '10px 20px', backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
    actionBtn: { width: '32px', height: '32px', borderRadius: '6px', border: 'none', backgroundColor: '#F1F3F4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: COLORS.TEXT_SECONDARY, padding: 0} as React.CSSProperties,
};

export default MyEvents;