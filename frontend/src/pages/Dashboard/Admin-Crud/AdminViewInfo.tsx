import React, { useState, useEffect, useCallback } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaLockOpen, FaClock, FaBirthdayCake } from 'react-icons/fa';

// Định nghĩa Interface cho dữ liệu User nhận được từ API
interface UserInfo {
    id: string;
    email: string;
    username: string;
    fullName: string | null;
    phoneNumber: string | null;
    avatar: string | null;
    address: string | null;
    bio: string | null;
    dateOfBirth: string | null;
    status: 'active' | 'inactive' | 'locked';
    age: number | null;
    createdAt: string;
    updatedAt: string;
}

// Giả sử COLORS được export/import từ file chung
const COLORS = {
    PRIMARY: '#1A73E8',
    DARK_NAVY: '#202124',
    CARD_BG: '#FFFFFF',
    BORDER: '#EBEBEB',
    TEXT_SECONDARY: '#5F6368',
    DANGER: '#EA4335',
    SUCCESS_ACCENT: '#34A853',
    BACKGROUND: '',
    WHITE: '#FFFFFF',
};

interface AdminViewInfoProps {
    userId: string;
    onClose: () => void;
}

const AdminViewInfo: React.FC<AdminViewInfoProps> = ({ userId, onClose }) => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Hàm lấy token từ localStorage
    const getAuthToken = () => localStorage.getItem('accessToken');

    const fetchUserInfo = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setUserInfo(null);

        const token = getAuthToken();
        if (!token) {
            setError("Authentication token not found.");
            setIsLoading(false);
            return;
        }

        try {
            const url = `http://localhost:8000/users/${userId}`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setUserInfo(data.data);
            } else {
                setError(data.message || `Failed to fetch user info for ID: ${userId}`);
            }
        } catch (err) {
            setError("Network error: Could not connect to the API.");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchUserInfo();
        }
    }, [userId, fetchUserInfo]);
    
    // Hàm format ngày tháng
    const formatDateTime = (isoDate: string | null) => {
        if (!isoDate) return 'N/A';
        return new Date(isoDate).toLocaleString('vi-VN', { 
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit' 
        });
    };
    
    const renderInfoItem = (Icon: React.ElementType, label: string, value: string | null) => (
        <div style={viewInfoStyles.infoItem}>
            <Icon size={16} style={{ color: COLORS.PRIMARY, marginRight: '10px' }} />
            <span style={viewInfoStyles.infoLabel}>{label}:</span>
            <span style={viewInfoStyles.infoValue}>{value || 'Chưa cập nhật'}</span>
        </div>
    );
    

    return (
        <div style={viewInfoStyles.modalOverlay}>
            <div style={viewInfoStyles.modalContainer}>
                {/* Header */}
                <div style={viewInfoStyles.modalHeader}>
                    <h3 style={viewInfoStyles.modalTitle}>User Details: {userInfo?.username}</h3>
                    <button onClick={onClose} style={viewInfoStyles.closeButton}>
                        <FaTimes size={18} />
                    </button>
                </div>
                
                {/* Body */}
                <div style={viewInfoStyles.modalBody}>
                    {isLoading && <p style={{ textAlign: 'center' }}>Loading user data...</p>}
                    {error && <p style={{ color: COLORS.DANGER, textAlign: 'center' }}>{error}</p>}
                    
                    {userInfo && (
                        <div style={viewInfoStyles.userInfoGrid}>
                            {renderInfoItem(FaUser, "Full Name", userInfo.fullName)}
                            {renderInfoItem(FaEnvelope, "Email", userInfo.email)}
                            {renderInfoItem(FaPhone, "Phone", userInfo.phoneNumber)}
                            {renderInfoItem(FaBirthdayCake, "DoB", userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth).toLocaleDateString('vi-VN') : null)}
                            
                            <div style={viewInfoStyles.infoItem}>
                                <FaLockOpen size={16} style={{ marginRight: '10px', color: userInfo.status === 'active' ? COLORS.SUCCESS_ACCENT : COLORS.DANGER }} />
                                <span style={viewInfoStyles.infoLabel}>Status:</span>
                                <span style={{...viewInfoStyles.infoValue, fontWeight: '700', color: userInfo.status === 'active' ? COLORS.SUCCESS_ACCENT : COLORS.DANGER}}>
                                    {userInfo.status.toUpperCase()}
                                </span>
                            </div>

                            {renderInfoItem(FaMapMarkerAlt, "Address", userInfo.address)}
                            {renderInfoItem(FaClock, "Created At", formatDateTime(userInfo.createdAt))}
                            {renderInfoItem(FaClock, "Last Updated", formatDateTime(userInfo.updatedAt))}
                            
                            {/* Bio (full width) */}
                            <div style={{ ...viewInfoStyles.infoItem, gridColumn: '1 / 3', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{...viewInfoStyles.infoLabel, marginBottom: '5px'}}>Bio:</span>
                                <p style={{...viewInfoStyles.infoValue, backgroundColor: COLORS.BACKGROUND, padding: '10px', borderRadius: '4px', width: '100%', whiteSpace: 'pre-wrap'}}>
                                    {userInfo.bio || 'Không có tiểu sử.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer (nếu cần action) */}
                <div style={viewInfoStyles.modalFooter}>
                    <button onClick={onClose} style={viewInfoStyles.secondaryButton}>Close</button>
                </div>
            </div>
        </div>
    );
};


const viewInfoStyles: { [key: string]: React.CSSProperties } = {
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
    },
    modalContainer: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: '8px',
        width: '90%', maxWidth: '650px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '90vh',
    },
    modalHeader: {
        padding: '20px',
        borderBottom: `1px solid ${COLORS.BORDER}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    modalTitle: {
        margin: 0, fontSize: '20px', color: COLORS.DARK_NAVY, fontWeight: '600',
    },
    closeButton: {
        background: 'none', border: 'none', cursor: 'pointer', color: COLORS.WHITE,
        padding: '5px',
    },
    modalBody: {
        padding: '20px',
        overflowY: 'auto',
        flexGrow: 1,
    },
    userInfoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
    },
    infoItem: {
        display: 'flex', alignItems: 'center',
        padding: '10px 0',
    },
    infoLabel: {
        fontWeight: '500', color: COLORS.TEXT_SECONDARY, marginRight: '5px', fontSize: '14px',
    },
    infoValue: {
        color: COLORS.DARK_NAVY, fontWeight: '400', fontSize: '14px',
    },
    modalFooter: {
        padding: '15px 20px',
        borderTop: `1px solid ${COLORS.BORDER}`,
        textAlign: 'right',
    },
    secondaryButton: {
        padding: '10px 20px',
        backgroundColor: COLORS.BACKGROUND,
        color: COLORS.WHITE,
        border: `1px solid ${COLORS.BORDER}`,
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
    }
};

export default AdminViewInfo;