import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    FaCalendarCheck, FaChartLine, FaClipboardList, FaUsers, FaUser, FaPlus, FaSignOutAlt, FaEye, FaEdit, FaTrash, FaCheckCircle, FaExclamationTriangle,
    FaHourglassHalf, FaTimesCircle, FaCommentDots, FaBars, FaClipboard
} from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const COLORS = {
    PRIMARY: '#1A73E8', 
    DARK_NAVY: '#202124', 
    BACKGROUND: '#F8F9FA', 
    CARD_BG: '#FFFFFF', 
    BORDER: '#EBEBEB', 
    TEXT_SECONDARY: '#5F6368', 
    DANGER: '#EA4335', 
    SUCCESS_ACCENT: '#34A853', 
    WARNING: '#FBC02D', 
    WHITE: '#FFFFFF',
    LIGHT_PRIMARY: '#e8f0fe', 
};

interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
}

interface Registration {
    id: string;
    registrationCode: string;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    organizerId: string;
    organizerName: string;
    volunteerId: string;
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
        emergencyContact: {
            name: string;
            phone: string;
            relationship: string;
        };
    };
    createdAt: string;
}

interface ManagerEvent {
    id: number;
    title: string;
    status: 'Draft' | 'Published' | 'Archived';
    registrations: number;
    capacity: number;
    startDate: string;
    endDate: string;
    categoryId: string;
}

interface UserData {
    id: string; 
    authId: string; 
    email: string;
    username: string;
    fullName: string | null;
    phoneNumber: string | null;
    avatar: string | null;
    address: string | null;
    bio: string | null;
    dateOfBirth: string | null;
}

// ----------------------------------------------------
// ĐỊNH NGHĨA STYLES ĐÃ ĐƯỢC SỬA LỖI LAYOUT
// ----------------------------------------------------

const styles: { [key: string]: React.CSSProperties } = {
    fullScreen: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: COLORS.BACKGROUND,
        fontFamily: 'Roboto, Arial, sans-serif',
        // Đảm bảo không có overflow ngang do scrollbar của OS (nếu cần)
        overflowX: 'hidden', 
    },
    sidebar: {
        width: '280px',
        backgroundColor: COLORS.CARD_BG,
        boxShadow: '2px 0 6px rgba(0, 0, 0, 0.05)',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed', // Giữ cố định
        height: '100%',
        zIndex: 1000,
        flexShrink: 0,
    },
    sidebarHeader: {
        padding: '0 20px 20px',
        borderBottom: `1px solid ${COLORS.BORDER}`,
        marginBottom: '20px',
    },
    logo: {
        color: COLORS.PRIMARY,
        fontSize: '24px',
        fontWeight: '700',
        margin: '0',
    },
    navMenu: {
        flexGrow: 1,
        listStyle: 'none',
        padding: '0 20px',
        margin: 0,
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 15px',
        margin: '5px 0',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s, color 0.2s',
        color: COLORS.DARK_NAVY,
        fontWeight: '500',
    },
    navItemHover: {
        backgroundColor: COLORS.BACKGROUND,
    },
    navItemActive: {
        backgroundColor: COLORS.LIGHT_PRIMARY,
        color: COLORS.PRIMARY,
        fontWeight: '600',
    },
    navIcon: {
        marginRight: '15px',
    },
    logoutSection: {
        padding: '20px',
        borderTop: `1px solid ${COLORS.BORDER}`,
    },
    logoutButton: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 15px',
        borderRadius: '8px',
        backgroundColor: 'transparent',
        border: `1px solid ${COLORS.DANGER}`,
        color: COLORS.DANGER,
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    
    // // *** SỬA LAYOUT Ở ĐÂY ***
    // mainContent: {
    //     // Loại bỏ flexGrow: 1 (vì Sidebar là fixed)
    //     marginLeft: '280px', // Bù trừ cho Sidebar
    //     padding: '30px',
    //     transition: 'margin-left 0.3s',
    //     // Thiết lập chiều rộng dựa trên Viewport để nó không bị thụt lề
    //     width: 'calc(100vw - 280px)', 
    // },
    // // ***********************
    
    mainContent: {
        flex: 1,                    // 🔥 Quan trọng – cho phép chiếm toàn bộ phần còn lại
        marginLeft: '280px',        // 🔥 Bù khoảng sidebar cố định
        padding: '30px',
        minWidth: 0,                // 🔥 Ngăn overflow ngang
        boxSizing: 'border-box',
        overflowX: 'hidden',
    },
    contentTitle: {
        color: COLORS.DARK_NAVY,
        margin: '0 0 5px 0',
        fontSize: '28px',
        fontWeight: '700',
    },
    contentSubtitle: {
        color: COLORS.TEXT_SECONDARY,
        margin: '0 0 20px 0',
        fontSize: '15px',
    },
    // TABLE
    tableContainer: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        overflowX: 'auto',
        padding: '0', // Đã chuyển padding lên component cha
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
    },
    tableHeader: {
        backgroundColor: COLORS.BACKGROUND,
        color: COLORS.TEXT_SECONDARY,
        fontWeight: '600',
        padding: '12px 15px',
        borderBottom: `2px solid ${COLORS.BORDER}`,
        textTransform: 'uppercase',
        fontSize: '12px',
    },
    tableRow: {
        borderBottom: `1px solid ${COLORS.BORDER}`,
        transition: 'background-color 0.2s',
    },
    tableCell: {
        padding: '15px',
        color: COLORS.DARK_NAVY,
        fontSize: '14px',
        verticalAlign: 'top',
    },
    tableCellActions: {
        padding: '15px',
        width: '120px',
        textAlign: 'center',
    },
    statusTag: {
        padding: '4px 10px',
        borderRadius: '15px',
        fontWeight: '600',
        fontSize: '12px',
        display: 'inline-block',
        minWidth: '80px',
        textAlign: 'center',
    },
    actionButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px',
        borderRadius: '4px',
        transition: 'background-color 0.15s',
    },
    modalBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
    },
    rejectModal: {
        backgroundColor: COLORS.CARD_BG,
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
        width: '400px',
        maxWidth: '90%',
        textAlign: 'center',
    },
    textareaModal: {
        width: '100%',
        minHeight: '120px',
        padding: '10px',
        borderRadius: '6px',
        border: `1px solid ${COLORS.BORDER}`,
        boxSizing: 'border-box',
        fontSize: '14px',
        marginBottom: '20px',
        resize: 'none',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
    },
    actionButtonModal: {
        padding: '10px 15px',
        borderRadius: '8px',
        border: 'none',
        color: COLORS.WHITE,
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'opacity 0.2s',
    },
    detailRow: {
        backgroundColor: COLORS.BACKGROUND,
    },
    detailCell: {
        padding: '0',
    },
    detailCard: {
        padding: '20px 30px',
        borderTop: `2px solid ${COLORS.PRIMARY}`,
        backgroundColor: COLORS.WHITE,
    },
    detailHeader: {
        color: COLORS.PRIMARY,
        fontSize: '18px',
        marginBottom: '15px',
        borderBottom: `1px dashed ${COLORS.BORDER}`,
        paddingBottom: '10px',
    },
    detailContent: {
        fontSize: '14px',
        lineHeight: '1.6',
        wordBreak: 'break-word',
        color: COLORS.DARK_NAVY,
    },
};


const ManagerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<'overview' | 'my_events' | 'pending_registrations' | 'profile'>('pending_registrations');
    const [user, setUser] = useState<UserData | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pendingRegistrations, setPendingRegistrations] = useState<Registration[]>([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    

    const categoryMap = useMemo(() => {
        return categories.reduce((map, category) => {
            map.set(category.id, category);
            return map;
        }, new Map<string, Category>());
    }, [categories]);


    const fetchPendingRegistrations = useCallback(async (organizerId: string) => {
        setLoadingRegistrations(true);
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setLoadingRegistrations(false);
            return; 
        }

        try {
            const res = await fetch(`${API_BASE_URL}/registrations?organizerId=${organizerId}&status=pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                navigate("/manager/login");
                return;
            }

            const result = await res.json();
            if (res.ok && result.success && Array.isArray(result.data)) {
                setPendingRegistrations(result.data as Registration[]);
            } else {
                console.error("Failed to fetch pending registrations:", result.message);
                setPendingRegistrations([]);
            }
        } catch (err) {
            console.error("Network error fetching registrations:", err);
            setPendingRegistrations([]);
        } finally {
            setLoadingRegistrations(false);
        }
    }, [navigate]);

    const handleRegistrationAction = useCallback(async (registrationId: string, action: 'accept' | 'reject', reason?: string) => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Authentication expired. Please log in again.");
            return navigate("/manager/login");
        }

        const endpoint = `${API_BASE_URL}/registrations/${registrationId}/${action}`;
        const method = 'PUT';
        const body = action === 'reject' ? { rejectionReason: reason || "No reason provided." } : {};

        try {
            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                // Sử dụng hàm cập nhật state mới để loại bỏ ứng dụng đã xử lý
                setPendingRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
                // alert(`Registration ${registrationId} ${action === 'accept' ? 'approved' : 'rejected'} successfully!`);
                
            } else {
                alert(`Failed to ${action} registration: ${result.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error(`Error during registration ${action}:`, error);
            alert(`Network error or API failure during registration ${action}.`);
        }
    }, [navigate]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/categories?activeOnly=true`);
            const result = await res.json();
            
            if (res.ok && result.success && result.data) {
                setCategories(result.data as Category[]);
            } else {
                console.error("Failed to fetch categories:", result.message);
            }
        } catch (err) {
            console.error("Network error fetching categories:", err);
        }
    }, []);

    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        const defaultAvatarUrl = `${API_BASE_URL}/uploads/avatars/default.png`; 

        if (!token) {
            navigate("/manager/login");
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
            
            if (res.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                navigate("/manager/login");
                return;
            }
            
            const result = await res.json();
            
            if (!result || !result.success || !result.data) return;

            const userData = result.data;

            userData.avatar = userData.avatar 
                ? (userData.avatar.startsWith('http') ? userData.avatar : `${API_BASE_URL}${userData.avatar}`)
                : defaultAvatarUrl;

            setUser(userData); 

            fetchPendingRegistrations(userData.authId); 

        } catch (err) {
            console.error("Failed to fetch user:", err);
        }
    }, [navigate, fetchPendingRegistrations]);

    useEffect(() => {
        fetchUserProfile();
        fetchCategories(); 
        setActiveSection('pending_registrations');
    }, [fetchUserProfile, fetchCategories]);

    
    const handleLogout = () => {
        localStorage.removeItem("accessToken"); 
        localStorage.removeItem("refreshToken"); 
        localStorage.removeItem("role"); 
        navigate("/manager/login");
    };

    const getStatusStyle = (status: ManagerEvent['status'] | Registration['status']): React.CSSProperties => {
        switch (status) {
            case 'Published':
            case 'approved':
                return { ...styles.statusTag, backgroundColor: '#E6F4EA', color: COLORS.SUCCESS_ACCENT, border: `1px solid ${COLORS.SUCCESS_ACCENT}` };
            case 'Draft':
            case 'pending':
                return { ...styles.statusTag, backgroundColor: '#F0F7FF', color: COLORS.PRIMARY, border: `1px solid ${COLORS.PRIMARY}` };
            case 'Archived':
            case 'rejected':
                return { ...styles.statusTag, backgroundColor: '#FCE8E6', color: COLORS.DANGER, border: `1px solid ${COLORS.DANGER}` };
            case 'completed':
                return { ...styles.statusTag, backgroundColor: '#FFF7E6', color: COLORS.WARNING, border: `1px solid ${COLORS.WARNING}` };
            default:
                return styles.statusTag;
        }
    };

    const RejectModal: React.FC<{
        registrationId: string;
        onClose: () => void;
        onConfirm: (id: string, reason: string) => void;
    }> = ({ registrationId, onClose, onConfirm }) => {
        const [reason, setReason] = useState("");

        const handleConfirm = () => {
            if (reason.trim() === "") {
                alert("Please provide a rejection reason.");
                return;
            }
            onConfirm(registrationId, reason);
        };

        return (
            <div style={styles.modalBackdrop}>
                <div style={styles.rejectModal}>
                    <FaExclamationTriangle size={30} color={COLORS.DANGER} style={{ marginBottom: '15px' }} />
                    <h3 style={{ color: COLORS.DARK_NAVY, margin: '0 0 10px 0' }}>Confirm Rejection</h3>
                    <p style={{ color: COLORS.TEXT_SECONDARY, marginBottom: '20px' }}>Please provide a clear reason for rejecting this application (ID: {registrationId.substring(0, 8)}...).</p>
                    <textarea 
                        style={styles.textareaModal}
                        placeholder="Rejection Reason..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <div style={styles.modalActions}>
                        <button 
                            onClick={onClose} 
                            style={{ ...styles.actionButtonModal, backgroundColor: COLORS.TEXT_SECONDARY }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirm} 
                            style={{ ...styles.actionButtonModal, backgroundColor: COLORS.DANGER }}
                            disabled={reason.trim() === ""}
                        >
                            <FaTimesCircle style={{marginRight: '5px'}} /> Reject
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const PendingRegistrationsList: React.FC = () => {
        const [showDetails, setShowDetails] = useState<string | null>(null); 
        const [showRejectModal, setShowRejectModal] = useState<string | null>(null); 

        if (loadingRegistrations) {
            return <p style={{ textAlign: 'center', padding: '20px', color: COLORS.TEXT_SECONDARY }}>Loading pending registrations...</p>;
        }

        if (pendingRegistrations.length === 0) {
            return <div style={{ 
                padding: '40px', 
                backgroundColor: COLORS.CARD_BG, 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                textAlign: 'center', 
                color: COLORS.TEXT_SECONDARY 
            }}>
                        <FaHourglassHalf size={50} style={{ marginBottom: '10px', color: COLORS.PRIMARY }} />
                        <h3>🎉 No Pending Applications</h3>
                        <p>All applications have been reviewed.</p>
                    </div>;
        }

        const handleRejectClick = (id: string) => {
            setShowRejectModal(id);
        };

        const handleConfirmReject = (id: string, reason: string) => {
            handleRegistrationAction(id, 'reject', reason);
            setShowRejectModal(null);
        };
        
        const currentDetailReg = showDetails ? pendingRegistrations.find(reg => reg.id === showDetails) : null;

        return (
            <div style={styles.tableContainer}>
                <div style={{padding: '20px'}}>
                    <h2 style={{...styles.contentTitle, fontSize: '24px', marginBottom: '10px'}}>Volunteer Applications ({pendingRegistrations.length})</h2>
                    <p style={styles.contentSubtitle}>Review and process applications from volunteers.</p>
                </div>
                
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Volunteer Info</th>
                            <th style={styles.tableHeader}>Event & Role</th>
                            <th style={styles.tableHeader}>Submitted Date</th>
                            <th style={styles.tableHeader}>Status</th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingRegistrations.map(reg => (
                            <React.Fragment key={reg.id}>
                                <tr style={{...styles.tableRow, backgroundColor: showDetails === reg.id ? '#f7f9fc' : COLORS.CARD_BG}}>
                                    <td style={styles.tableCell}>
                                        <strong>{reg.volunteerName}</strong><br />
                                        <span style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY }}>{reg.volunteerEmail} | {reg.volunteerPhone}</span>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <span style={{ fontWeight: '500', color: COLORS.DARK_NAVY }}>{reg.eventTitle}</span><br />
                                        <span style={{ fontSize: '12px', color: COLORS.PRIMARY }}>Role: {reg.roleName}</span>
                                    </td>
                                    <td style={styles.tableCell}>
                                        {new Date(reg.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={styles.tableCell}>
                                        <span style={getStatusStyle(reg.status)}>{reg.status.toUpperCase()}</span>
                                    </td>
                                    <td style={styles.tableCellActions}>
                                        <button 
                                            onClick={() => setShowDetails(showDetails === reg.id ? null : reg.id)} 
                                            title="View Details" 
                                            style={{...styles.actionButton, color: COLORS.TEXT_SECONDARY}}
                                        >
                                            <FaEye size={16} style={{ color: showDetails === reg.id ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY }} />
                                        </button>
                                        <button 
                                            onClick={() => handleRegistrationAction(reg.id, 'accept')} 
                                            title="Approve" 
                                            style={{...styles.actionButton, color: COLORS.SUCCESS_ACCENT}}
                                        >
                                            <FaCheckCircle size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleRejectClick(reg.id)} 
                                            title="Reject" 
                                            style={{...styles.actionButton, color: COLORS.DANGER}}
                                        >
                                            <FaTimesCircle size={16} />
                                        </button>
                                    </td>
                                </tr>
                                {showDetails === reg.id && currentDetailReg && (
                                    <tr style={styles.detailRow}>
                                        <td colSpan={5} style={styles.detailCell}>
                                            <div style={styles.detailCard}>
                                                <h4 style={styles.detailHeader}>Application Details (ID: {currentDetailReg.registrationCode})</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                    <div>
                                                        <p style={{ fontWeight: '600', color: COLORS.DARK_NAVY, margin: '5px 0' }}>Motivation:</p>
                                                        <p style={styles.detailContent}>{currentDetailReg.applicationForm.motivation || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: '600', color: COLORS.DARK_NAVY, margin: '5px 0' }}>Experience:</p>
                                                        <p style={styles.detailContent}>{currentDetailReg.applicationForm.experience || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: '600', color: COLORS.DARK_NAVY, margin: '5px 0' }}>Skills:</p>
                                                        <p style={styles.detailContent}>{currentDetailReg.applicationForm.skills.join(', ') || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: '600', color: COLORS.DARK_NAVY, margin: '5px 0' }}>Availability:</p>
                                                        <p style={styles.detailContent}>{currentDetailReg.applicationForm.availability || 'N/A'}</p>
                                                    </div>
                                                    <div style={{gridColumn: 'span 2'}}>
                                                        <p style={{ fontWeight: '600', color: COLORS.DARK_NAVY, margin: '5px 0' }}>Emergency Contact:</p>
                                                        <p style={styles.detailContent}>
                                                            Name: {currentDetailReg.applicationForm.emergencyContact.name || 'N/A'} | 
                                                            Phone: {currentDetailReg.applicationForm.emergencyContact.phone || 'N/A'} | 
                                                            Relationship: {currentDetailReg.applicationForm.emergencyContact.relationship || 'N/A'}
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

                {showRejectModal && (
                    <RejectModal
                        registrationId={showRejectModal}
                        onClose={() => setShowRejectModal(null)}
                        onConfirm={handleConfirmReject}
                    />
                )}
            </div>
        );
    };

    const renderSidebar = () => (
        <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
                <h1 style={styles.logo}>Manager Portal</h1>
            </div>
            <ul style={styles.navMenu}>
                {/* Giữ nguyên Pending Registrations là mục active */}
                <li 
                    style={{ ...styles.navItem, ...styles.navItemActive }}
                >
                    <FaClipboardList style={styles.navIcon} />
                    <span>Pending Registrations</span>
                </li>
            </ul>
            <div style={styles.logoutSection}>
                <button 
                    style={styles.logoutButton} 
                    onClick={handleLogout}
                >
                    <FaSignOutAlt style={{ marginRight: '8px' }} /> Log Out ({user?.username || 'User'})
                </button>
            </div>
        </div>
    );

    const renderContent = () => {
        return <PendingRegistrationsList />;
    };

    return (
        <div style={styles.fullScreen}>
            {/* Sidebar cố định */}
            {renderSidebar()}
            
            {/* Main Content với width tính toán bằng 100vw */}
            <main style={styles.mainContent}>
                {renderContent()}
            </main>
        </div>
    );
};

export default ManagerDashboard;