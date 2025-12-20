import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    FaUsers, FaSignOutAlt, FaClipboardList, FaLayerGroup, FaChartBar,
    FaArrowLeft, FaSearch, FaSignInAlt, FaSignOutAlt as FaLogOut, FaCheckCircle, 
    FaClock, FaPhoneAlt, FaFilter, FaStar 
} from 'react-icons/fa';

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
    STAR_EMPTY: '#DADCE0',
    STAR_ACTIVE: '#FFC107'
};

const EventAttendance: React.FC = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [eventTitle, setEventTitle] = useState("");

    // --- STATE CHO RATING ---
    const [ratingModal, setRatingModal] = useState<{show: boolean, regId: string | null, name: string}>({ 
        show: false, regId: null, name: "" 
    });
    const [ratingData, setRatingData] = useState({ 
        performance: 5, punctuality: 5, teamwork: 5, comment: "" 
    });

    // Helper component để vẽ sao
    const StarRating = ({ value, label, field }: { value: number, label: string, field: string }) => (
        <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: '600', fontSize: '13px', color: COLORS.TEXT_MAIN, textTransform: 'capitalize' }}>{label}</span>
                <span style={{ fontSize: '12px', color: COLORS.PRIMARY, fontWeight: 'bold' }}>{value}/5</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        size={24}
                        style={{ 
                            cursor: 'pointer', 
                            transition: 'transform 0.1s ease',
                            color: star <= value ? COLORS.STAR_ACTIVE : COLORS.STAR_EMPTY 
                        }}
                        onClick={() => setRatingData({ ...ratingData, [field]: star })}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                ))}
            </div>
        </div>
    );

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

    const fetchAttendanceList = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/registrations?eventId=${eventId}&limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                const validStatus = ['accepted', 'confirmed', 'checked_in', 'checked_out', 'completed'];
                const filtered = result.data.filter((reg: any) => validStatus.includes(reg.status));
                setVolunteers(filtered);
                if (filtered.length > 0) setEventTitle(filtered[0].eventTitle);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchUserProfile();
        fetchAttendanceList();
    }, [fetchUserProfile, fetchAttendanceList]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/manager/login");
    };

    const handleAttendanceAction = async (registrationId: string, action: 'check-in' | 'check-out') => {
        const token = localStorage.getItem("accessToken");
        if (!window.confirm(`Confirm ${action} for this volunteer?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/registrations/${registrationId}/${action}`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})
            });
            const result = await res.json();

            if (result.success) {
                let finalData = result.data;
                if (action === 'check-out') {
                    try {
                        const completeRes = await fetch(`${API_BASE_URL}/registrations/${registrationId}/complete`, {
                            method: "PUT",
                            headers: { 
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });
                        const completeResult = await completeRes.json();
                        if (completeResult.success) {
                            finalData = completeResult.data;
                        }
                    } catch (err) {
                        console.error("Auto-completion failed:", err);
                    }
                }
                setVolunteers(prev => prev.map(v => v.id === registrationId ? finalData : v));
            } else {
                alert(result.message);
            }
        } catch (err) { 
            alert("Action failed"); 
        }
    };

    const handleRateVolunteer = async () => {
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/registrations/${ratingModal.regId}/rate-volunteer`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(ratingData)
            });
            const result = await res.json();
            if (result.success) {
                alert("Volunteer rated successfully!");
                setVolunteers(prev => prev.map(v => v.id === ratingModal.regId ? result.data : v));
                setRatingModal({ show: false, regId: null, name: "" });
                setRatingData({ performance: 5, punctuality: 5, teamwork: 5, comment: "" });
            } else {
                alert(result.message);
            }
        } catch (err) { 
            alert("Rating failed"); 
        }
    };

    const filteredVolunteers = volunteers.filter(v => 
        v.volunteerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.registrationCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: COLORS.BACKGROUND }}>
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

            <main style={{ marginLeft: '280px', flex: 1, padding: '40px', boxSizing: 'border-box' }}>
                <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate(-1)} style={styles.backBtn}><FaArrowLeft /></button>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '28px', color: COLORS.DARK_NAVY }}>Event Attendance</h1>
                            <p style={{ margin: '8px 0 0', color: COLORS.TEXT_SECONDARY }}>{eventTitle || "Loading event info..."}</p>
                        </div>
                    </div>
                    <div style={styles.searchBox}>
                        <FaSearch color={COLORS.TEXT_SECONDARY} />
                        <input 
                            placeholder="Search volunteer name..." 
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                <div style={styles.card}>
                    <div style={{ padding: '20px', borderBottom: `1px solid ${COLORS.BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>Volunteer List ({filteredVolunteers.length})</span>
                        <FaFilter color={COLORS.TEXT_SECONDARY} style={{ cursor: 'pointer' }} />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8F9FA' }}>
                                    <th style={styles.th}>Volunteer Info</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={styles.th}>Attendance Time</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Loading list...</td></tr>
                                ) : filteredVolunteers.map(vol => (
                                    <tr key={vol.id} style={{ borderBottom: `1px solid ${COLORS.BORDER}` }}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 'bold', color: COLORS.DARK_NAVY }}>{vol.volunteerName}</div>
                                            <div style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY }}>{vol.registrationCode}</div>
                                            <div style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY }}><FaPhoneAlt size={10}/> {vol.volunteerPhone}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.roleTag}>{vol.roleName}</span>
                                        </td>
                                        <td style={styles.td}>
                                            {vol.attendance?.checkInTime && (
                                                <div style={styles.timeLabel}><FaClock size={12} color={COLORS.SUCCESS_ACCENT}/> In: {new Date(vol.attendance.checkInTime).toLocaleTimeString()}</div>
                                            )}
                                            {vol.attendance?.checkOutTime && (
                                                <div style={styles.timeLabel}><FaClock size={12} color={COLORS.DANGER}/> Out: {new Date(vol.attendance.checkOutTime).toLocaleTimeString()}</div>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: vol.status === 'completed' || vol.status === 'checked_in' ? '#E6F4EA' : vol.status === 'checked_out' ? '#F1F3F4' : '#FEF7E0',
                                                color: vol.status === 'completed' || vol.status === 'checked_in' ? COLORS.SUCCESS_ACCENT : vol.status === 'checked_out' ? COLORS.TEXT_SECONDARY : COLORS.WARNING
                                            }}>
                                                {vol.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'right' }}>
                                            {vol.status !== 'checked_in' && vol.status !== 'checked_out' && vol.status !== 'completed' && (
                                                <button onClick={() => handleAttendanceAction(vol.id, 'check-in')} style={{ ...styles.attendanceBtn, backgroundColor: COLORS.PRIMARY }}>
                                                    <FaSignInAlt /> Check-in
                                                </button>
                                            )}
                                            {vol.status === 'checked_in' && (
                                                <button onClick={() => handleAttendanceAction(vol.id, 'check-out')} style={{ ...styles.attendanceBtn, backgroundColor: COLORS.DANGER }}>
                                                    <FaLogOut /> Check-out
                                                </button>
                                            )}
                                            {vol.status === 'completed' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                                    <div style={{ color: COLORS.SUCCESS_ACCENT, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                                                        <FaCheckCircle /> Completed
                                                    </div>
                                                    <button 
                                                        onClick={() => setRatingModal({ show: true, regId: vol.id, name: vol.volunteerName })}
                                                        style={{ ...styles.attendanceBtn, backgroundColor: COLORS.WARNING, fontSize: '12px', padding: '6px 12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                                    >
                                                        <FaStar /> Rate Volunteer
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* --- MODAL RATING VOLUNTEER --- */}
            {ratingModal.show && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={{ borderBottom: `1px solid ${COLORS.BORDER}`, paddingBottom: '15px', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: COLORS.DARK_NAVY }}>Chấm điểm tình nguyện viên</h2>
                            <p style={{ margin: '5px 0 0', color: COLORS.TEXT_SECONDARY, fontSize: '14px' }}>
                                Đánh giá cho: <strong style={{ color: COLORS.PRIMARY }}>{ratingModal.name}</strong>
                            </p>
                        </div>
                        
                        <StarRating label="Chất lượng công việc (Performance)" field="performance" value={ratingData.performance} />
                        <StarRating label="Đúng giờ (Punctuality)" field="punctuality" value={ratingData.punctuality} />
                        <StarRating label="Làm việc nhóm (Teamwork)" field="teamwork" value={ratingData.teamwork} />

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px', color: COLORS.TEXT_MAIN }}>Nhận xét thêm</label>
                            <textarea 
                                placeholder="Viết vài dòng nhận xét về thái độ hoặc đóng góp..."
                                style={styles.modalTextarea}
                                value={ratingData.comment}
                                onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button 
                                onClick={() => setRatingModal({ show: false, regId: null, name: "" })}
                                style={{ ...styles.attendanceBtn, backgroundColor: '#f1f3f4', color: COLORS.TEXT_MAIN, boxShadow: 'none' }}
                            >Đóng</button>
                            <button 
                                onClick={handleRateVolunteer}
                                style={{ ...styles.attendanceBtn, backgroundColor: COLORS.PRIMARY, padding: '10px 24px' }}
                            >Gửi đánh giá</button>
                        </div>
                    </div>
                </div>
            )}
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
    backBtn: { padding: 0, width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: COLORS.WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' } as React.CSSProperties,
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: COLORS.WHITE, padding: '10px 20px', borderRadius: '24px', width: '300px', border: `1px solid ${COLORS.BORDER}` } as React.CSSProperties,
    searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '14px' } as React.CSSProperties,
    attendanceBtn: { border: 'none', color: COLORS.WHITE, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold' } as React.CSSProperties,
    roleTag: { backgroundColor: COLORS.LIGHT_PRIMARY, color: COLORS.PRIMARY, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' } as React.CSSProperties,
    badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' } as React.CSSProperties,
    timeLabel: { fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' } as React.CSSProperties,
    
    // MODAL STYLES
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' } as React.CSSProperties,
    modalContent: { backgroundColor: COLORS.WHITE, padding: '30px', borderRadius: '20px', width: '450px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', transform: 'translateY(0)', animation: 'modalFadeIn 0.3s ease-out' } as React.CSSProperties,
    modalTextarea: { width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${COLORS.BORDER}`, minHeight: '100px', outline: 'none', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none' } as React.CSSProperties,
};

export default EventAttendance;