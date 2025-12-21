import React, { useEffect, useState, useCallback } from "react";
import {
    FaClipboardList, FaUsers, FaUser, FaSignOutAlt, FaEye, FaCheckCircle, FaExclamationTriangle,
    FaTimesCircle, FaCommentDots, FaChevronUp, FaPhoneAlt, FaMapMarkerAlt,
    FaClipboard,
    FaPlus,
    FaLayerGroup,
    FaChartBar,
    FaComments
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
    WHITE: '#FFFFFF',
    LIGHT_PRIMARY: '#E8F0FE', 
    SIDEBAR_BG: '#FFFFFF', 
    SIDEBAR_TEXT: '#3C4043', 
    SIDEBAR_BORDER: '#DADCE0', 
};

// --- INTERFACES ---
interface Registration {
    id: string;
    registrationCode: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    volunteerName: string;
    volunteerEmail: string;
    volunteerPhone: string;
    roleName: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    applicationForm: {
        motivation: string;
        experience: string;
        skills: string[];
        availability: string;
        emergencyContact: { name: string; phone: string; relationship: string; };
    };
    createdAt: string;
}

interface UserData { id: string; authId: string; email: string; username: string; avatar: string | null; }

const ManagerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);
    const [pendingRegistrations, setPendingRegistrations] = useState<Registration[]>([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);

    // --- LOGIC XỬ LÝ API ---
    const fetchPendingRegistrations = useCallback(async (organizerId: string) => {
        setLoadingRegistrations(true);
        const token = localStorage.getItem("accessToken");
        if (!token) { setLoadingRegistrations(false); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/registrations?organizerId=${organizerId}&status=pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401) { handleLogout(); return; }
            const result = await res.json();
            if (res.ok && result.success && Array.isArray(result.data)) {
                setPendingRegistrations(result.data);
            }
        } catch (err) { console.error(err); } finally { setLoadingRegistrations(false); }
    }, []);

    const handleRegistrationAction = useCallback(async (registrationId: string, action: 'accept' | 'reject', reason?: string) => {
        const token = localStorage.getItem("accessToken");
        if (!token) return navigate("/manager/login");
        const body = action === 'reject' ? { rejectionReason: reason || "No reason provided." } : {};
        try {
            const res = await fetch(`${API_BASE_URL}/registrations/${registrationId}/${action}`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setPendingRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
            } else { alert(result.message); }
        } catch (error) { console.error(error); }
    }, [navigate]);

    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) { navigate("/manager/login"); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.status === 401) { handleLogout(); return; }
            const result = await res.json();
            if (result.success) {
                const userData = result.data;
                userData.avatar = userData.avatar ? (userData.avatar.startsWith('http') ? userData.avatar : `${API_BASE_URL}${userData.avatar}`) : `https://ui-avatars.com/api/?name=${userData.username}&background=random`;
                setUser(userData);
                fetchPendingRegistrations(userData.authId);
            }
        } catch (err) { console.error(err); }
    }, [navigate, fetchPendingRegistrations]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/manager/login");
    };

    // --- REJECT MODAL ---
    const RejectModal: React.FC<{ registrationId: string; onClose: () => void; onConfirm: (id: string, reason: string) => void; }> = ({ registrationId, onClose, onConfirm }) => {
        const [reason, setReason] = useState("");
        return (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' }}>
                <div style={{ backgroundColor: COLORS.CARD_BG, padding: '30px', borderRadius: '16px', width: '450px', boxShadow: '0 24px 38px rgba(0,0,0,0.3)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <FaExclamationTriangle size={40} color={COLORS.DANGER} />
                        <h3 style={{ margin: '15px 0 5px' }}>Reject Application</h3>
                        <p style={{ color: COLORS.TEXT_SECONDARY, fontSize: '14px' }}>Please provide a reason for rejection.</p>
                    </div>
                    <textarea
                        style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.BORDER}`, fontSize: '14px', marginBottom: '20px', outlineColor: COLORS.PRIMARY }}
                        placeholder="Reason..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                        <button onClick={() => onConfirm(registrationId, reason)} disabled={!reason.trim()} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: COLORS.DANGER, color: COLORS.WHITE, cursor: 'pointer', fontWeight: 'bold', opacity: reason.trim() ? 1 : 0.6 }}>Reject</button>
                    </div>
                </div>
            </div>
        );
    };

    // --- PENDING LIST COMPONENT ---
    const PendingRegistrationsList: React.FC = () => {
        const [showDetails, setShowDetails] = useState<string | null>(null);
        const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

        if (loadingRegistrations) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

        if (pendingRegistrations.length === 0) return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', backgroundColor: COLORS.CARD_BG, borderRadius: '16px', border: `1px dashed ${COLORS.BORDER}`, margin: '20px' }}>
                <FaClipboard size={60} color={COLORS.BORDER} />
                <h2 style={{ color: COLORS.TEXT_SECONDARY, marginTop: '20px' }}>No Pending Applications</h2>
            </div>
        );

        return (
            <div style={{ backgroundColor: COLORS.CARD_BG, borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', margin: '0 0 20px 0' }}>
                <div style={{ padding: '24px', borderBottom: `1px solid ${COLORS.BORDER}` }}>
                    <h2 style={{ fontSize: '20px', margin: 0, color: COLORS.DARK_NAVY }}>Volunteer Requests</h2>
                    <p style={{ margin: '5px 0 0', color: COLORS.TEXT_SECONDARY, fontSize: '14px' }}>Total {pendingRegistrations.length} applications</p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F8F9FA' }}>
                                <th style={styles.thStyle}>Volunteer</th>
                                <th style={styles.thStyle}>Event & Role</th>
                                <th style={styles.thStyle}>Date Submitted</th>
                                <th style={styles.thStyle}>Status</th>
                                <th style={{ ...styles.thStyle, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingRegistrations.map(reg => (
                                <React.Fragment key={reg.id}>
                                    <tr style={{ borderBottom: `1px solid ${COLORS.BORDER}` }}>
                                        <td style={styles.tdStyle}>
                                            <div style={{ fontWeight: '600' }}>{reg.volunteerName}</div>
                                            <div style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY }}>{reg.volunteerEmail}</div>
                                        </td>
                                        <td style={styles.tdStyle}>
                                            <div style={{ fontWeight: '500' }}>{reg.eventTitle}</div>
                                            <div style={{ fontSize: '12px', color: COLORS.PRIMARY }}>{reg.roleName}</div>
                                        </td>
                                        <td style={styles.tdStyle}>{new Date(reg.createdAt).toLocaleDateString()}</td>
                                        <td style={styles.tdStyle}>
                                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: COLORS.LIGHT_PRIMARY, color: COLORS.PRIMARY, border: `1px solid ${COLORS.PRIMARY}` }}>
                                                {reg.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ ...styles.tdStyle, textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px',  }}>
                                                <button onClick={() => setShowDetails(showDetails === reg.id ? null : reg.id)} style={styles.iconBtnStyle(COLORS.PRIMARY, COLORS.LIGHT_PRIMARY)}>
                                                    {showDetails === reg.id ? <FaChevronUp /> : <FaEye />}
                                                </button>
                                                <button onClick={() => handleRegistrationAction(reg.id, 'accept')} style={styles.iconBtnStyle(COLORS.SUCCESS_ACCENT, '#E6F4EA')}><FaCheckCircle /></button>
                                                <button onClick={() => setShowRejectModal(reg.id)} style={styles.iconBtnStyle(COLORS.DANGER, '#FCE8E6')}><FaTimesCircle /></button>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    {/* PHẦN HIỂN THỊ CHI TIẾT THEO YÊU CẦU CỦA BẠN */}
                                    {showDetails === reg.id && (
                                        <tr style={styles.detailRow}>
                                            <td colSpan={5} style={styles.detailCell}>
                                                <div style={styles.detailCard}>
                                                    <h4 style={styles.detailHeader}>Application Details (ID: {reg.registrationCode})</h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                        <div>
                                                            <p style={styles.detailLabel}>Motivation:</p>
                                                            <p style={styles.detailContent}>{reg.applicationForm.motivation || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p style={styles.detailLabel}>Experience:</p>
                                                            <p style={styles.detailContent}>{reg.applicationForm.experience || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p style={styles.detailLabel}>Skills:</p>
                                                            <p style={styles.detailContent}>
                                                                {reg.applicationForm.skills && reg.applicationForm.skills.length > 0 
                                                                    ? reg.applicationForm.skills.join(', ') 
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p style={styles.detailLabel}>Availability:</p>
                                                            <p style={styles.detailContent}>{reg.applicationForm.availability || 'N/A'}</p>
                                                        </div>
                                                        <div style={{ gridColumn: 'span 2' }}>
                                                            <p style={styles.detailLabel}>Emergency Contact:</p>
                                                            <p style={{ ...styles.detailContent, backgroundColor: COLORS.WHITE, padding: '10px', borderRadius: '8px', border: `1px solid ${COLORS.BORDER}` }}>
                                                                <strong>Name:</strong> {reg.applicationForm.emergencyContact.name || 'N/A'} | 
                                                                <strong> Phone:</strong> {reg.applicationForm.emergencyContact.phone || 'N/A'} | 
                                                                <strong> Relationship:</strong> {reg.applicationForm.emergencyContact.relationship || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                {showRejectModal && <RejectModal registrationId={showRejectModal} onClose={() => setShowRejectModal(null)} onConfirm={(id, res) => { handleRegistrationAction(id, 'reject', res); setShowRejectModal(null); }} />}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden', backgroundColor: COLORS.BACKGROUND }}>
            
            {/* SIDEBAR TRẮNG */}
            <aside style={{ width: '280px', minWidth: '280px', backgroundColor: COLORS.SIDEBAR_BG, color: COLORS.SIDEBAR_TEXT, display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', borderRight: `1px solid ${COLORS.SIDEBAR_BORDER}` }}>
                <div style={{ padding: '30px 24px', borderBottom: `1px solid ${COLORS.SIDEBAR_BORDER}` }}>
                    <h1 style={{ fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: COLORS.DARK_NAVY }}><FaUsers color={COLORS.PRIMARY} /> Manager</h1>
                </div>
                <nav style={{ flex: 1, padding: '20px 12px' }}>
                    <div 
                            onClick={() => navigate("/manager/statistics")} // Giả định path dashboard
                            style={{ ...styles.navItemStyle, marginBottom: '8px', cursor: 'pointer' }}
                        >
                            <FaChartBar style={{ marginRight: '12px' }} /> Statistics
                        </div>
                        <div 
                            onClick={() => navigate("/manager/pending-applications")} // Giả định path dashboard
                            style={{ ...styles.navItemStyle, backgroundColor: 'rgba(26, 115, 232, 0.15)', color: COLORS.PRIMARY, marginBottom: '8px', cursor: 'pointer' }}
                        >
                            <FaClipboardList style={{ marginRight: '12px' }} /> Pending Applications
                        </div>
                        <div 
                            onClick={() => navigate("/manager/my-events")}
                            style={{ ...styles.navItemStyle, cursor: 'pointer' }}
                        >
                            <FaLayerGroup style={{ marginRight: '12px' }} /> My Events
                        </div>
                        <div 
                            onClick={() => navigate("/manager/communication")}
                            style={{ ...styles.navItemStyle, cursor: 'pointer' }}
                        >
                            <FaComments style={{ marginRight: '12px' }} /> Communications
                        </div>
                </nav>
                <div style={{ padding: '20px', borderTop: `1px solid ${COLORS.SIDEBAR_BORDER}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <img src={user?.avatar || ''} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: `1px solid ${COLORS.SIDEBAR_BORDER}` }} alt="avatar" onClick={() => navigate('/me/profile')}/>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{user?.username}</div>
                            <div style={{ fontSize: '11px', color: COLORS.TEXT_SECONDARY }}>Organizer</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={styles.logoutBtnStyle}><FaSignOutAlt /> Logout</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '40px', boxSizing: 'border-box' }}>
                <header style={{ marginBottom: '30px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', color: COLORS.DARK_NAVY }}>Dashboard</h1>
                    <p style={{ margin: '8px 0 0', color: COLORS.TEXT_SECONDARY }}>Welcome back! Here is what's happening today.</p>
                </header>

                <div style={{ flex: 1 }}>
                    <PendingRegistrationsList />
                </div>
            </main>
        </div>
    );
};

// --- STYLES OBJECT ---
const styles = {
    thStyle: { padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: COLORS.TEXT_SECONDARY, fontWeight: 'bold', textTransform: 'uppercase' } as React.CSSProperties,
    tdStyle: { padding: '18px 24px', fontSize: '14px', color: COLORS.TEXT_MAIN, verticalAlign: 'middle' } as React.CSSProperties,
    navItemStyle: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' } as React.CSSProperties,
    logoutBtnStyle: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#FCE8E6', color: COLORS.DANGER, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' } as React.CSSProperties,
    iconBtnStyle: (color: string, bg: string): React.CSSProperties => ({ width: '36px', height: '36px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color, backgroundColor: bg, padding: 0 }),
    
    // Detail Styles
    detailRow: { backgroundColor: '#FAFBFC' } as React.CSSProperties,
    detailCell: { padding: '24px' } as React.CSSProperties,
    detailCard: { backgroundColor: '#F1F3F4', padding: '20px', borderRadius: '12px', border: `1px solid ${COLORS.BORDER}` } as React.CSSProperties,
    detailHeader: { margin: '0 0 15px 0', color: COLORS.PRIMARY, fontSize: '16px', borderBottom: `1px solid ${COLORS.BORDER}`, paddingBottom: '10px' } as React.CSSProperties,
    detailLabel: { fontWeight: '600', color: COLORS.DARK_NAVY, margin: '5px 0', fontSize: '14px' } as React.CSSProperties,
    detailContent: { color: COLORS.TEXT_MAIN, fontSize: '14px', margin: '0 0 10px 0', lineHeight: '1.5' } as React.CSSProperties,
};

export default ManagerDashboard;