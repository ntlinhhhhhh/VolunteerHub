import React, { useState, useEffect } from 'react';
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
    email: string;
    username: string;
    fullName: string;
    status: 'active' | 'locked'; 
    createdAt: string;
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0); 
    const [totalCount, setTotalCount] = useState(0); // STATE MỚI: Lưu tổng số user

    // Cập nhật cách tính KPI để sử dụng totalCount
    const kpis = [
        { title: "Total Users", value: totalCount.toLocaleString(), icon: FaUsers, color: COLORS.PRIMARY },
        { title: "Active Events", value: "245", icon: FaCalendarAlt, color: COLORS.SECONDARY },
        { title: "Total Registrations", value: "35,200", icon: FaTicketAlt, color: COLORS.SUCCESS_ACCENT },
        { title: "Managers Count", value: "18", icon: FaShieldAlt, color: COLORS.DANGER },
    ];

    const handleRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
        setLoading(true);
    };

    // LOGIC FETCH DATA: Chạy lại khi refreshKey thay đổi
    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('accessToken'); 
            if (!token) { setError("Token not found."); setLoading(false); return; }

            try {
                const res = await fetch("http://localhost:8000/users/", {
                    method: "GET",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                });
                const result = await res.json();
                
                if (res.ok && result.success) {
                    const processedUsers = result.data.users.map((user: any) => ({
                        ...user,
                        status: user.status === 'active' ? 'active' : 'locked',
                    }));
                    
                    setUsers(processedUsers);
                    
                    // CẬP NHẬT: Trích xuất và lưu trữ tổng số người dùng (Total Count)
                    // Backend có thể trả về { success: true, total: 12, data: { users: [...] } }
                    const totalFromBackend = result.total || (result.data && result.data.total); 
                    setTotalCount(totalFromBackend || processedUsers.length);
                    
                    setError(null);
                } else {
                    setError(result.message || "Failed to fetch user data.");
                    setTotalCount(0);
                }
            } catch (err) {
                setError("Network error.");
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [refreshKey]); 

    const toggleUserStatus = (userId: string) => {
        console.log(`Toggling status for User ID: ${userId}`);
        // Giả lập cập nhật trạng thái UI và sau đó gọi fetch lại
        setTimeout(() => {
            handleRefresh(); 
        }, 500); 
    };

    const renderUserTable = () => {
        if (loading && users.length === 0) return <p style={{ textAlign: 'center', padding: '20px' }}>Loading users...</p>;
        if (error) return <p style={{ color: COLORS.DANGER, textAlign: 'center', padding: '20px' }}>Error: {error}</p>;
        if (users.length === 0) return <p style={{ textAlign: 'center', padding: '20px', color: COLORS.TEXT_SECONDARY }}>No users found.</p>;

        return (
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, width: '20%'}}>Full Name</th>
                            <th style={{...styles.th, width: '25%'}}>Email</th>
                            <th style={{...styles.th, width: '15%'}}>Username</th>
                            <th style={{...styles.th, width: '15%'}}>Status</th>
                            <th style={{...styles.th, width: '25%', textAlign: 'center'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={styles.tr}>
                                <td style={styles.td}>{user.fullName || 'N/A'}</td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>{user.username}</td>
                                <td style={styles.td}>
                                    <span style={user.status === 'active' ? styles.statusActive : styles.statusLocked}>
                                        {user.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{...styles.td, textAlign: 'center'}}>
                                    <button 
                                        style={user.status === 'active' ? styles.lockButton : styles.unlockButton}
                                        onClick={() => toggleUserStatus(user.id)}
                                        title={user.status === 'active' ? "Lock User" : "Unlock User"}
                                    >
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

// --- STYLES TỐI GIẢN (GOOGLE-LIKE) ---
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

    // KPI CARDS
    kpiGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px',
    },
    kpiCard: {
        backgroundColor: COLORS.CARD_BG, padding: '20px', borderRadius: '4px', border: `1px solid ${COLORS.BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
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
    lockButton: {
        padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: COLORS.DANGER, color: COLORS.WHITE, transition: 'background-color 0.2s', marginRight: '5px',
    },
    unlockButton: {
        padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: COLORS.SUCCESS_ACCENT, color: COLORS.WHITE, transition: 'background-color 0.2s', marginRight: '5px',
    }
};

export default AdminDashboard;