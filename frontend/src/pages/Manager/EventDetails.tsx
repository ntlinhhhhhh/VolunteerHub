import React, { useEffect, useState, useCallback } from "react";
import {
    FaUsers, FaSignOutAlt, FaClipboardList, FaCalendarAlt,
    FaMapMarkerAlt, FaLayerGroup, FaChartBar, FaArrowLeft, FaEnvelope, FaPhone, FaCheck, FaTimes, FaClock
} from 'react-icons/fa';
import { useNavigate, useParams } from "react-router-dom";

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

const EventDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH USER PROFILE ---
    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) { navigate("/manager/login"); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
            const result = await res.json();
            if (result.success) setUser(result.data);
        } catch (err) { console.error(err); }
    }, [navigate]);

    // --- FETCH REGISTRATIONS ---
    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/registrations?eventId=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) setRegistrations(result.data);
        } catch (err) {
            console.error("Fetch registrations error:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUserProfile();
        fetchRegistrations();
    }, [fetchUserProfile, fetchRegistrations]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/manager/login");
    };

    // --- API HANDLERS ---
    const handleAction = async (regId: string, action: 'accept' | 'reject' | 'cancel') => {
        const token = localStorage.getItem("accessToken");
        let url = `${API_BASE_URL}/registrations/${regId}`;
        let method = 'PUT';
        let body: any = {};

        if (action === 'accept') {
            url += '/accept';
        } else if (action === 'reject') {
            const reason = window.prompt("Lý do từ chối:");
            if (reason === null) return; // Người dùng nhấn Hủy
            url += '/reject';
            body = { rejectionReason: reason || "Không đủ điều kiện" };
        } else if (action === 'cancel') {
            const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa/hủy đăng ký này?");
            if (!confirmDelete) return;
            const reason = window.prompt("Lý do hủy:");
            url += '/cancel-by-organizer';
            method = 'DELETE';
            body = { cancellationReason: reason || "Thay đổi từ phía ban tổ chức" };
        }

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const result = await res.json();
            if (result.success || res.ok) {
                alert("Thao tác thành công!");
                fetchRegistrations(); // Load lại danh sách
            } else {
                alert("Lỗi: " + (result.message || "Không thể thực hiện"));
            }
        } catch (err) {
            console.error("Action error:", err);
            alert("Đã có lỗi xảy ra");
        }
    };

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        let style = { bg: '#F1F3F4', color: COLORS.TEXT_SECONDARY };
        if (s === 'confirmed' || s === 'accepted') style = { bg: '#E6F4EA', color: COLORS.SUCCESS_ACCENT };
        if (s === 'pending') style = { bg: '#FEF7E0', color: COLORS.WARNING };
        if (s === 'rejected') style = { bg: '#FCE8E6', color: COLORS.DANGER };

        return (
            <span style={{ 
                padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                backgroundColor: style.bg, color: style.color, textTransform: 'uppercase'
            }}>
                {status}
            </span>
        );
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: COLORS.BACKGROUND, fontFamily: "'Roboto', sans-serif" }}>
            
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
                    <div onClick={() => navigate("/manager/my-events")} style={{ ...styles.navItem, backgroundColor: 'rgba(26, 115, 232, 0.15)', color: COLORS.PRIMARY }}>
                        <FaLayerGroup style={{ marginRight: '12px' }} /> My Events
                    </div>
                </nav>
                <div style={{ padding: '20px', borderTop: `1px solid ${COLORS.SIDEBAR_BORDER}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}`} style={{ width: '35px', height: '35px', borderRadius: '50%' }} alt="avatar" />
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
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    <FaArrowLeft /> Back to My Events
                </button>
                <p></p>

                <header style={{ marginBottom: '30px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', color: COLORS.DARK_NAVY }}>
                        {registrations.length > 0 ? registrations[0].eventTitle : "Event Registrations"}
                    </h1>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px', color: COLORS.TEXT_SECONDARY, fontSize: '14px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaCalendarAlt size={14} /> {registrations.length > 0 ? new Date(registrations[0].eventDate).toLocaleDateString() : 'N/A'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaMapMarkerAlt size={14} /> {registrations.length > 0 ? registrations[0].eventLocation : 'N/A'}
                        </span>
                    </div>
                </header>

                <div style={styles.card}>
                    <div style={{ padding: '20px', borderBottom: `1px solid ${COLORS.BORDER}`, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Volunteer List ({registrations.length})</span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8F9FA' }}>
                                    <th style={styles.th}>Volunteer Info</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={styles.th}>Motivation & Experience</th>
                                    <th style={styles.th}>Applied At</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading registrations...</td></tr>
                                ) : registrations.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No registrations found.</td></tr>
                                ) : registrations.map((reg) => (
                                    <tr key={reg.id} style={{ borderBottom: `1px solid ${COLORS.BORDER}` }}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 'bold', color: COLORS.DARK_NAVY }}>{reg.volunteerName}</div>
                                            <div style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaEnvelope size={10} /> {reg.volunteerEmail}
                                            </div>
                                            <div style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaPhone size={10} /> {reg.volunteerPhone}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ color: COLORS.PRIMARY, fontWeight: '500' }}>{reg.roleName}</div>
                                        </td>
                                        <td style={{ ...styles.td, maxWidth: '250px' }}>
                                            <div style={{ fontSize: '13px', color: COLORS.TEXT_MAIN, marginBottom: '4px' }}>
                                                <strong>Exp:</strong> {reg.applicationForm.experience}
                                            </div>
                                            <div style={styles.motivationText} title={reg.applicationForm.motivation}>
                                                {reg.applicationForm.motivation}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaClock size={12} color={COLORS.TEXT_SECONDARY} />
                                                {new Date(reg.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            {getStatusBadge(reg.status)}
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'right' }}>
                                            {/* <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button style={{ ...styles.smallActionBtn, color: COLORS.SUCCESS_ACCENT }} title="Accept"><FaCheck /></button>
                                                <button style={{ ...styles.smallActionBtn, color: COLORS.DANGER }} title="Reject"><FaTimes /></button>
                                            </div> */}
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                {reg.status.toLowerCase() === 'pending' ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleAction(reg.id, 'accept')}
                                                            style={{ ...styles.smallActionBtn, color: COLORS.SUCCESS_ACCENT }} 
                                                            title="Duyệt"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(reg.id, 'reject')}
                                                            style={{ ...styles.smallActionBtn, color: COLORS.DANGER }} 
                                                            title="Từ chối"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleAction(reg.id, 'cancel')}
                                                        style={{ ...styles.smallActionBtn, color: COLORS.DANGER, backgroundColor: '#FFF5F5' }} 
                                                        title="Xóa/Hủy"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                )}
                                            </div>
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

const styles = {
    sidebar: { width: '280px', minWidth: '280px', backgroundColor: COLORS.SIDEBAR_BG, color: COLORS.SIDEBAR_TEXT , position: 'fixed', height: '100vh', borderRight: `1px solid ${COLORS.SIDEBAR_BORDER}`, display: 'flex', flexDirection: 'column' } as React.CSSProperties,
    navItem: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginBottom: '4px', transition: '0.2s' } as React.CSSProperties,
    logoutBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#FCE8E6', color: COLORS.DANGER, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' } as React.CSSProperties,
    card: { backgroundColor: COLORS.CARD_BG, borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', border: `1px solid ${COLORS.BORDER}` } as React.CSSProperties,
    th: { padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: COLORS.TEXT_SECONDARY, fontWeight: 'bold', textTransform: 'uppercase' } as React.CSSProperties,
    td: { padding: '20px 24px', fontSize: '14px', color: COLORS.TEXT_MAIN, verticalAlign: 'middle' } as React.CSSProperties,
    backBtn: { padding: 0, background: 'none', border: 'none', color: COLORS.PRIMARY, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' } as React.CSSProperties,
    motivationText: { fontSize: '12px', color: COLORS.TEXT_SECONDARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as React.CSSProperties,
    smallActionBtn: { padding: 0, width: '28px', height: '28px', borderRadius: '4px', border: `1px solid ${COLORS.BORDER}`, backgroundColor: COLORS.BACKGROUND, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
};

export default EventDetails;