// src/pages/admin/AdminDashboard.tsx (Phiên bản FIX lỗi hiển thị Status và Icon)
import React, { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaCalendarAlt, FaTicketAlt, FaShieldAlt, FaFilter, FaLock, FaUnlock, FaSearch, FaChevronRight, FaSync } from 'react-icons/fa';

// --- BẢNG MÀU TỐI GIẢN (GOOGLE-LIKE) ---
const COLORS = {
    PRIMARY: '#1A73E8', // Màu Xanh Google/Accent chính
    SECONDARY: '#4285F4', // Màu Xanh Lam
    DARK_NAVY: '#202124', // Màu chữ đậm
    BACKGROUND: '#F8F9FA', // Nền siêu sáng
    CARD_BG: '#FFFFFF',
    BORDER: '#EBEBEB', // Đường viền mỏng
    SUCCESS_ACCENT: '#34A853', // Xanh Lá
    DANGER: '#EA4335', // Đỏ
    TEXT_SECONDARY: '#5F6368', // Màu chữ phụ
    WHITE: '#FFFFFF',
};

interface DashboardStyles {
    [key: string]: React.CSSProperties;
}

interface User {
    id: string;
    authId: string; 
    email: string;
    username: string;
    fullName: string;
    role: 'admin' | 'event_manager' | 'user'; 
    status: 'active' | 'locked'; // Trạng thái chuẩn hóa cho Frontend
    createdAt: string;
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0); 
    const [totalCount, setTotalCount] = useState(0); 
    const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const kpis = [
        { title: "Total Users", value: totalCount.toLocaleString(), icon: FaUsers, color: COLORS.PRIMARY },
        { title: "Active Events", value: "245", icon: FaCalendarAlt, color: COLORS.SECONDARY },
        { title: "Total Registrations", value: "35,200", icon: FaTicketAlt, color: COLORS.SUCCESS_ACCENT },
        { title: "Managers Count", value: "18", icon: FaShieldAlt, color: COLORS.DANGER },
    ];

    const handleRefresh = useCallback(() => {
        setRefreshKey(prevKey => prevKey + 1);
        setLoading(true);
        setError(null); 
        setActionMessage(null); 
    }, []);

    // Fetch Data Logic
    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('accessToken'); 
            if (!token) { setError("Token not found. Vui lòng đăng nhập lại."); setLoading(false); return; }

            try {
                const res = await fetch("http://localhost:8000/users/", {
                    method: "GET",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                });
                
                if (!res.ok) {
                    const errorResult = await res.json();
                    setError(errorResult.message || `Failed to fetch users (HTTP ${res.status}).`);
                    setTotalCount(0);
                    return;
                }
                
                const result = await res.json();
                
                if (result.success) {
                    const usersArray = result.data.users || [];
                    
                    const processedUsers = usersArray.map((user: any) => {
                        
                        // >>> LOGIC CHUẨN HÓA STATUS MỚI (QUAN TRỌNG) <<<
                        let determinedStatus: User['status'] = 'active';
                        
                        // 1. Ưu tiên kiểm tra trường 'isLocked' (boolean) từ Backend
                        if (typeof user.isLocked === 'boolean') {
                            determinedStatus = user.isLocked ? 'locked' : 'active';
                        } 
                        // 2. Nếu không có 'isLocked', fallback về trường 'status' (string)
                        else if (user.status) {
                            determinedStatus = user.status.toLowerCase() === 'active' ? 'active' : 'locked';
                        }

                        return {
                            ...user,
                            status: determinedStatus, // Gán status đã được chuẩn hóa
                            role: (user.roleName || user.role || 'user').toLowerCase() === 'admin' ? 'admin' : ((user.roleName || user.role || 'user').toLowerCase() === 'event_manager' ? 'event_manager' : 'user'),
                            authId: user.authId || user.id, 
                        };
                    }) as User[];
                    
                    setUsers(processedUsers);
                    const totalFromBackend = result.data?.total; 
                    setTotalCount(totalFromBackend ?? processedUsers.length);
                    setError(null);
                } else {
                    setError(result.message || "Failed to fetch user data.");
                    setTotalCount(0);
                }
            } catch (err) {
                setError("Network error or server unreachable.");
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [refreshKey]); 

    // Timer cho Action Message
    useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => setActionMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [actionMessage]);

    // >>> LOGIC QUAN TRỌNG: Thực hiện gọi API Khóa/Mở khóa <<<
    const toggleUserStatus = async (userAuthId: string, currentStatus: User['status']) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setActionMessage({ type: 'error', text: "Token not found. Please log in again." });
            return;
        }
        
        // Hành động được xác định dựa trên trạng thái HIỆN TẠI (currentStatus)
        const action = currentStatus === 'active' ? 'lock' : 'unlock';
        const confirmMessage = `Bạn có chắc chắn muốn ${action === 'lock' ? 'KHÓA' : 'MỞ KHÓA'} người dùng này (Auth ID: ${userAuthId})?`;
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        const endpoint = `http://localhost:8000/users/${userAuthId}/${action}`;
        const payload = action === 'lock' ? { reason: "Admin action via dashboard" } : {}; 

        setLoading(true); 

        try {
            const res = await fetch(endpoint, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (res.ok) {
                setActionMessage({ type: 'success', text: `✅ User đã được ${action === 'lock' ? 'KHÓA' : 'MỞ KHÓA'} thành công!` });

                // CẬP NHẬT TRẠNG THÁI TRÊN FRONTEND NGAY LẬP TỨC 
                setUsers(prevUsers => 
                    prevUsers.map(u => 
                        u.authId === userAuthId 
                            ? { ...u, status: action === 'lock' ? 'locked' : 'active' } 
                            : u
                    )
                );
                
                // Sau đó, fetch lại data để đồng bộ hoàn toàn
                handleRefresh(); 
                
            } else {
                // Hiển thị lỗi từ backend
                setActionMessage({ 
                    type: 'error', 
                    text: `❌ Thao tác ${action === 'lock' ? 'khóa' : 'mở khóa'} thất bại: ${result.message || res.statusText || 'Lỗi không xác định.'}` 
                });
                setLoading(false);
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: "❌ Lỗi mạng trong quá trình thay đổi trạng thái." });
            setLoading(false);
        }
    };

    // HÀM HELPER ĐỂ TẠO STYLE CHO ROLE BADGE
    const getRoleStyle = (role: User['role']) => {
        if (role === 'admin') return styles.roleAdmin;
        if (role === 'event_manager') return styles.roleManager;
        return styles.roleUser;
    };

    const getActionMessageStyle = () => {
        if (!actionMessage) return {};
        if (actionMessage.type === 'success') return styles.actionSuccessMessage;
        if (actionMessage.type === 'error') return styles.actionErrorMessage;
        return {};
    }

    const renderUserTable = () => {
        if (loading && users.length === 0) return <p style={{ textAlign: 'center', padding: '20px', color: COLORS.TEXT_SECONDARY }}>Loading users...</p>;
        if (error) return <p style={{ color: COLORS.DANGER, textAlign: 'center', padding: '20px' }}>Error fetching data: {error}</p>;
        if (users.length === 0) return <p style={{ textAlign: 'center', padding: '20px', color: COLORS.TEXT_SECONDARY }}>No users found.</p>;

        return (
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, width: '15%'}}>Full Name</th>
                            <th style={{...styles.th, width: '25%'}}>Email</th>
                            <th style={{...styles.th, width: '10%'}}>Username</th>
                            <th style={{...styles.th, width: '15%'}}>Role</th> 
                            <th style={{...styles.th, width: '15%'}}>Status</th>
                            <th style={{...styles.th, width: '20%', textAlign: 'center'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={styles.tr}>
                                <td style={styles.td}>{user.fullName || 'N/A'}</td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>{user.username}</td>
                                
                                {/* HIỂN THỊ ROLE */}
                                <td style={styles.td}>
                                    <span style={getRoleStyle(user.role)}>
                                        {user.role.toUpperCase().replace('_', ' ')}
                                    </span>
                                </td>
                                
                                <td style={styles.td}>
                                    {/* LOGIC HIỂN THỊ STATUS BADGE */}
                                    <span style={user.status === 'active' ? styles.statusActive : styles.statusLocked}>
                                        {user.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{...styles.td, textAlign: 'center'}}>
                                    <button 
                                        // LOGIC HIỂN THỊ MÀU BUTTON: active -> Đỏ (lockButton); locked -> Xanh lá (unlockButton)
                                        style={user.status === 'active' ? styles.lockButton : styles.unlockButton}
                                        onClick={() => toggleUserStatus(user.authId, user.status)} 
                                        title={user.status === 'active' ? "Khóa Người Dùng" : "Mở Khóa Người Dùng"}
                                        disabled={loading || user.role === 'admin'}
                                    >
                                        {/* LOGIC ICON: active -> hiện Khóa (FaLock); locked -> hiện Mở Khóa (FaUnlock) */}
                                        {user.status === 'active' ? <FaLock size={14} /> : <FaUnlock size={14} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div style={styles.dashboardContainer}>
             <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
            
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <h2 style={styles.logo}>Admin</h2>
                <div style={styles.navSectionTitle}>MENU</div>
                
                <div style={styles.navItemActive}>
                    <FaChevronRight size={10} style={{ marginRight: '15px' }} />
                    Dashboard
                </div>
                
                <div style={styles.navItem}>
                    <FaUsers size={14} style={{ marginRight: '15px' }} />
                    User Management
                </div>
                <div style={styles.navItem}>
                    <FaCalendarAlt size={14} style={{ marginRight: '15px' }} />
                    Event Approvals
                </div>
                <div style={styles.navItem}>
                    <FaShieldAlt size={14} style={{ marginRight: '15px' }} />
                    System Settings
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                <div style={styles.headerRow}>
                    <h1 style={styles.mainTitle}>Admin Dashboard</h1>
                    <button 
                        style={styles.refreshButton}
                        onClick={handleRefresh}
                        disabled={loading}
                        title="Refresh Data"
                    >
                        <FaSync size={14} style={{ marginRight: '8px' }} className={loading ? 'spin' : ''}/> 
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
                <p style={styles.mainSubtitle}>System statistics and user administration.</p>
                
                {/* Action Message Bar */}
                {actionMessage && (
                    <div style={{...styles.actionMessageBar, ...getActionMessageStyle()}}>
                        {actionMessage.text}
                    </div>
                )}

                {/* 1. KPI Cards */}
                <div style={styles.kpiGrid}>
                    {kpis.map((kpi) => (
                        <div key={kpi.title} style={styles.kpiCard}>
                            <div style={styles.kpiText}>
                                <p style={styles.kpiTitle}>{kpi.title}</p>
                                <h2 style={styles.kpiValue}>{kpi.value}</h2>
                            </div>
                            <kpi.icon size={28} color={kpi.color} style={{ opacity: 0.8 }} />
                        </div>
                    ))}
                </div>

                {/* 2. User Management Table (Bảng Người Dùng) */}
                <div style={styles.dataCard}>
                    <h3 style={styles.dataCardTitle}>
                        <FaUsers size={20} style={{marginRight: '10px', color: COLORS.PRIMARY}}/> User Management
                    </h3>
                    <div style={styles.tableToolbar}>
                        <div style={styles.searchWrapper}>
                            <FaSearch style={styles.searchIcon} />
                            <input type="text" placeholder="Search users..." style={styles.searchBar} />
                        </div>
                        <button style={styles.filterButton}>
                            <FaFilter style={{marginRight: '5px'}}/> Filter
                        </button>
                    </div>
                    {renderUserTable()}
                </div>
                
            </div>
        </div>
    );
};

// --- STYLES (Giữ nguyên) ---
const styles: DashboardStyles = {
    // LAYOUT & CHUNG
    dashboardContainer: {
        display: 'flex', minHeight: '100vh', width: '100vw', fontFamily: 'Roboto, Arial, sans-serif', backgroundColor: COLORS.BACKGROUND,
    },
    
    // SIDEBAR
    sidebar: {
        width: '240px', backgroundColor: COLORS.CARD_BG, color: COLORS.DARK_NAVY, padding: '20px 0', borderRight: `1px solid ${COLORS.BORDER}`, flexShrink: 0,
    },
    logo: {
        fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', padding: '0 25px', color: COLORS.DARK_NAVY,
    },
    navSectionTitle: {
        fontSize: '11px', fontWeight: '500', color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 25px 5px', marginTop: '10px',
    },
    navItem: {
        display: 'flex', alignItems: 'center', padding: '10px 25px', cursor: 'pointer', fontSize: '14px', color: COLORS.TEXT_SECONDARY, transition: 'background-color 0.2s',
    },
    navItemActive: {
        display: 'flex', alignItems: 'center', padding: '10px 25px', cursor: 'default', fontWeight: '500', fontSize: '14px', backgroundColor: '#E8F0FE', color: COLORS.PRIMARY, borderRight: `3px solid ${COLORS.PRIMARY}`,
    },
    
    // HEADER & MAIN CONTENT
    mainContent: {
        flexGrow: 1, padding: '30px 40px', backgroundColor: COLORS.BACKGROUND, overflowY: 'auto',
    },
    headerRow: { 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px',
    },
    mainTitle: { 
        fontSize: '28px', fontWeight: '400', color: COLORS.DARK_NAVY, margin: 0,
    },
    mainSubtitle: { 
        fontSize: '15px', color: COLORS.TEXT_SECONDARY, marginBottom: '30px',
    },
    refreshButton: { 
        padding: '8px 15px', backgroundColor: COLORS.CARD_BG, color: COLORS.TEXT_SECONDARY, border: `1px solid ${COLORS.BORDER}`, borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '14px',
        display: 'flex', alignItems: 'center', transition: 'background-color 0.2s',
    },

    // MESSAGE BARS
    actionMessageBar: {
        padding: '12px 20px',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '14px',
        fontWeight: '500',
    },
    actionSuccessMessage: {
        backgroundColor: '#E6F4EA',
        color: COLORS.SUCCESS_ACCENT,
        border: `1px solid ${COLORS.SUCCESS_ACCENT}`,
    },
    actionErrorMessage: {
        backgroundColor: '#FCE8E6',
        color: COLORS.DANGER,
        border: `1px solid ${COLORS.DANGER}`,
    },


    // KPI CARDS
    kpiGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px',
    },
    kpiCard: {
        backgroundColor: COLORS.CARD_BG, padding: '20px', borderRadius: '4px', border: `1px solid ${COLORS.BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'box-shadow 0.2s',
    },
    kpiText: {
        display: 'flex', flexDirection: 'column',
    },
    kpiTitle: { 
        fontSize: '14px', color: COLORS.TEXT_SECONDARY, margin: '0 0 5px 0', fontWeight: '500',
    },
    kpiValue: { 
        fontSize: '24px', fontWeight: '400', color: COLORS.DARK_NAVY, margin: '0',
    },

    // DATA TABLE & TOOLBAR
    dataCard: {
        backgroundColor: COLORS.CARD_BG, padding: '30px', borderRadius: '4px', border: `1px solid ${COLORS.BORDER}`,
    },
    dataCardTitle: {
        fontSize: '20px', fontWeight: '500', color: COLORS.DARK_NAVY, marginBottom: '25px', display: 'flex', alignItems: 'center',
    },
    tableToolbar: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
    },
    searchWrapper: {
        position: 'relative', width: '400px',
    },
    searchBar: {
        padding: '10px 15px 10px 40px', width: '100%', border: `1px solid ${COLORS.BORDER}`, borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
    },
    searchIcon: {
        position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: COLORS.TEXT_SECONDARY, fontSize: '14px',
    },
    filterButton: {
        padding: '10px 20px', backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center', transition: 'background-color 0.2s',
    },
    
    // TABLE
    tableWrapper: {
        overflowX: 'auto',
    },
    table: {
        width: '100%', minWidth: '900px', borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left', padding: '15px 0', color: COLORS.TEXT_SECONDARY, fontWeight: '500', borderBottom: `1px solid ${COLORS.BORDER}`, textTransform: 'none', fontSize: '13px',
    },
    td: {
        padding: '15px 0', borderBottom: `1px solid ${COLORS.BORDER}`, fontSize: '14px', color: COLORS.DARK_NAVY,
    },
    tr: {
        transition: 'background-color 0.15s',
    },

    // STATUS BADGES & ACTIONS
    statusActive: {
        padding: '4px 8px', borderRadius: '16px', backgroundColor: '#E6F4EA', color: COLORS.SUCCESS_ACCENT, fontWeight: '500', fontSize: '12px',
    },
    statusLocked: {
        padding: '4px 8px', borderRadius: '16px', backgroundColor: '#FCE8E6', color: COLORS.DANGER, fontWeight: '500', fontSize: '12px',
    },
    roleAdmin: { 
        padding: '4px 8px', borderRadius: '16px', backgroundColor: '#FAE3D8', color: '#B33020', fontWeight: '500', fontSize: '12px',
    },
    roleManager: { 
        padding: '4px 8px', borderRadius: '16px', backgroundColor: '#E8F0FE', color: COLORS.PRIMARY, fontWeight: '500', fontSize: '12px',
    },
    roleUser: { 
        padding: '4px 8px', borderRadius: '16px', backgroundColor: '#F1F3F4', color: COLORS.TEXT_SECONDARY, fontWeight: '500', fontSize: '12px',
    },
    lockButton: {
        padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: COLORS.DANGER, color: COLORS.WHITE, transition: 'background-color 0.2s', marginRight: '5px',
    },
    unlockButton: {
        padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: COLORS.SUCCESS_ACCENT, color: COLORS.WHITE, transition: 'background-color 0.2s', marginRight: '5px',
    }
};

export default AdminDashboard;