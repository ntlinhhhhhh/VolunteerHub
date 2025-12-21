import React, { useState, useEffect, useCallback } from "react";
import { 
    FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, 
    FaClock, FaBirthdayCake, FaInfoCircle, FaCalendarCheck 
} from 'react-icons/fa';

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

const COLORS = {
    PRIMARY: '#1A73E8',
    DARK_NAVY: '#202124',
    CARD_BG: '#FFFFFF',
    BORDER: '#EBEBEB',
    TEXT_SECONDARY: '#5F6368',
    DANGER: '#EA4335',
    SUCCESS: '#34A853',
    WARNING: '#FBBC04',
    SOFT_BG: '#F8F9FA',
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

    const fetchUserInfo = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');
        
        try {
            const res = await fetch(`http://localhost:8000/users/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok && data.success) {
                data.data.avatar = `http://localhost:8000${data.data.avatar}`;
                setUserInfo(data.data);
            } else {
                setError(data.message || "Không thể tải thông tin người dùng.");
            }
        } catch (err) {
            setError("Lỗi kết nối máy chủ.");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) fetchUserInfo();
    }, [userId, fetchUserInfo]);

    const formatDateTime = (isoDate: string | null) => {
        if (!isoDate) return 'N/A';
        return new Date(isoDate).toLocaleDateString('vi-VN', { 
            day: '2-digit', month: '2-digit', year: 'numeric' 
        });
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const bg = status === 'active' ? '#E6F4EA' : status === 'locked' ? '#FCE8E6' : '#FEF7E0';
        const color = status === 'active' ? COLORS.SUCCESS : status === 'locked' ? COLORS.DANGER : COLORS.WARNING;
        return (
            <span style={{ 
                backgroundColor: bg, color: color, padding: '4px 12px', 
                borderRadius: '12px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' 
            }}>
                {status}
            </span>
        );
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={styles.headerIcon}><FaInfoCircle color={COLORS.PRIMARY} /></div>
                        <h3 style={styles.title}>User Insight</h3>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}><FaTimes size={20} /></button>
                </div>

                <div style={styles.body}>
                    {isLoading ? (
                        <div style={styles.loadingArea}>Đang tải hồ sơ...</div>
                    ) : userInfo ? (
                        <div style={styles.contentWrapper}>
                            {/* Left Side: Profile Card */}
                            <div style={styles.sidebar}>
                                {/* <div style={styles.avatarCircle}>
                                    {userInfo.avatar ? (
                                        <img src={userInfo.avatar} alt="avatar" style={styles.avatarImg} />
                                    ) : (
                                        <div style={{ color: '#bdbdbd', fontSize: '12px' }}>avatar</div>
                                    )}
                                </div> */}
                                <div style={styles.avatarCircle}>
                                    {userInfo.avatar ? (
                                        <img src={userInfo.avatar} alt="avatar" style={styles.avatarImg} />
                                    ) : (
                                        <FaUser size={60} color="#DADCE0" /> 
                                    )}
                                </div>
                                <h2 style={styles.userName}>{userInfo.fullName || userInfo.username}</h2>
                                <p style={styles.userSubText}>@{userInfo.username}</p>
                                <div style={{ marginTop: '15px' }}>
                                    <StatusBadge status={userInfo.status} />
                                </div>
                            </div>

                            {/* Right Side: Details */}
                            <div style={styles.mainInfo}>
                                <div style={styles.infoGrid}>
                                    <InfoBox icon={<FaEnvelope />} label="Email" value={userInfo.email} isLongText={true} />
                                    <InfoBox icon={<FaPhone />} label="Phone" value={userInfo.phoneNumber} />
                                    <InfoBox icon={<FaBirthdayCake />} label="Birthday" value={formatDateTime(userInfo.dateOfBirth)} />
                                    <InfoBox icon={<FaMapMarkerAlt />} label="Location" value={userInfo.address} />
                                    <InfoBox icon={<FaCalendarCheck />} label="Joined Date" value={formatDateTime(userInfo.createdAt)} />
                                    <InfoBox icon={<FaClock />} label="Last Updated" value={formatDateTime(userInfo.updatedAt)} />
                                </div>

                                <div style={styles.bioSection}>
                                    <h4 style={styles.sectionTitle}>Biography</h4>
                                    <div style={styles.bioBox}>
                                        {userInfo.bio || "Người dùng này chưa viết tiểu sử."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: COLORS.DANGER }}>{error}</div>
                    )}
                </div>

                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.actionBtn}>Done</button>
                </div>
            </div>
        </div>
    );
};

// Component hỗ trợ hiển thị từng ô thông tin
const InfoBox = ({ icon, label, value, isLongText }: { icon: any, label: string, value: string | null, isLongText?: boolean }) => (
    <div style={styles.infoBox}>
        <div style={styles.boxIcon}>{icon}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
            <div style={styles.boxLabel}>{label}</div>
            <div 
                title={value || ''} 
                style={{ 
                    ...styles.boxValue, 
                    ...(isLongText ? styles.truncateText : {}) 
                }}
            >
                {value || 'Not provided'}
            </div>
        </div>
    </div>
);

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(32, 33, 36, 0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    },
    container: {
        backgroundColor: COLORS.WHITE, borderRadius: '16px',
        width: '95%', maxWidth: '750px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh',
    },
    header: {
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', 
        alignItems: 'center', borderBottom: `1px solid ${COLORS.BORDER}`,
    },
    headerIcon: { backgroundColor: '#E8F0FE', padding: '8px', borderRadius: '8px', display: 'flex' },
    title: { margin: 0, fontSize: '18px', color: COLORS.DARK_NAVY, fontWeight: '600' },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: COLORS.TEXT_SECONDARY },
    body: { overflowY: 'auto' },
    contentWrapper: { display: 'flex', flexWrap: 'wrap' },
    sidebar: {
        flex: '1 1 240px', backgroundColor: COLORS.SOFT_BG, padding: '40px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        borderRight: `1px solid ${COLORS.BORDER}`, textAlign: 'center',
    },
    // avatarCircle: {
    //     width: '110px', height: '110px', borderRadius: '50%', backgroundColor: '#E0E0E0',
    //     display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px',
    //     border: `4px solid ${COLORS.WHITE}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden'
    // },
    // avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    avatarCircle: {
        width: '110px',
        height: '110px',
        borderRadius: '50%',
        backgroundColor: '#F1F3F4', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '15px',
        border: `4px solid ${COLORS.WHITE}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        color: '#BDC1C6' 
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const, 
    },
    userName: { margin: '0 0 5px 0', fontSize: '20px', color: COLORS.DARK_NAVY, fontWeight: '700' },
    userSubText: { margin: 0, fontSize: '14px', color: COLORS.TEXT_SECONDARY },
    mainInfo: { flex: '2 1 350px', padding: '30px', minWidth: 0 },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px 20px' },
    infoBox: { display: 'flex', gap: '12px', alignItems: 'flex-start', minWidth: 0 },
    boxIcon: { color: COLORS.PRIMARY, marginTop: '3px', fontSize: '16px' },
    boxLabel: { fontSize: '11px', color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' },
    boxValue: { fontSize: '14px', color: COLORS.DARK_NAVY, fontWeight: '500', marginTop: '2px' },
    truncateText: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block',
        width: '100%'
    },
    bioSection: { marginTop: '30px', paddingTop: '20px', borderTop: `1px solid ${COLORS.BORDER}` },
    sectionTitle: { margin: '0 0 12px 0', fontSize: '14px', color: COLORS.DARK_NAVY, fontWeight: '600' },
    bioBox: { 
        padding: '15px', backgroundColor: COLORS.SOFT_BG, borderRadius: '8px', 
        fontSize: '14px', color: COLORS.TEXT_SECONDARY, lineHeight: '1.6' 
    },
    footer: { padding: '16px 24px', textAlign: 'right', borderTop: `1px solid ${COLORS.BORDER}` },
    actionBtn: { 
        padding: '8px 30px', backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, 
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: '0.2s'
    },
    loadingArea: { padding: '100px', textAlign: 'center', color: COLORS.TEXT_SECONDARY }
};

export default AdminViewInfo;