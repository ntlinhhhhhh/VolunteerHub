import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaUsers, FaCalendarAlt, FaTicketAlt, FaShieldAlt, FaFilter, FaLock, FaUnlock, FaSearch, FaChevronRight, FaSync, FaArrowAltCircleLeft, FaInfoCircle, FaClipboardList, FaChartPie, FaTags } from 'react-icons/fa'; // <<< THÊM ICONS MỚI
import { useNavigate } from "react-router-dom";
import AdminViewInfo from './Admin-Crud/AdminViewInfo';
import PendingEventsNotification from './Admin-Crud/PendingEventsNotification';
import EventsApproval from './Admin-Crud/EventsApproval';

// --- BẢNG MÀU TỐI GIẢN (GOOGLE-LIKE) ---
const COLORS = {
    PRIMARY: '#1A73E8', 
    SECONDARY: '#4285F4', 
    DARK_NAVY: '#202124', 
    BACKGROUND: '#F8F9FA', 
    CARD_BG: '#FFFFFF',
    BORDER: '#EBEBEB', 
    SUCCESS_ACCENT: '#34A853', 
    DANGER: '#EA4335', 
    TEXT_SECONDARY: '#5F6368', 
    WHITE: '#FFFFFF',
    WARNING: '#F7B200', // Vàng
    INFO: '#4CB7A5', // Xanh ngọc
};

// MAPPING MÀU CHO CÁC TRẠNG THÁI SỰ KIỆN
const EVENT_STATUS_COLORS: { [key: string]: string } = {
    'draft': COLORS.TEXT_SECONDARY,
    'pending_approval': COLORS.WARNING,
    'approved': COLORS.INFO,
    'published': COLORS.PRIMARY,
    'ongoing': COLORS.SECONDARY,
    'completed': COLORS.SUCCESS_ACCENT,
    'cancelled': COLORS.DANGER,
    'rejected': COLORS.DANGER,
};


interface DashboardStyles {
    [key: string]: React.CSSProperties;
}

interface PendingEvent {
    id: string;
    title: string;
    organizerName: string;
    createdAt: string;
}

interface EventStatistics {
    totalEvents: number;
    byStatus: { [key: string]: number };
    upcomingEvents: number;
    popularCategories: {
        categoryId: string;
        categoryName: string;
        count: number;
    }[];
}

interface User {
    id: string;
    authId: string; 
    email: string;
    username: string;
    fullName: string;
    role: 'admin' | 'event_manager' | 'user'; 
    status: 'active' | 'inactive'; 
    createdAt: string;
}

// <<< INTERFACE MỚI CHO EVENT STATISTICS >>>
interface EventStatistics {
    totalEvents: number;
    byStatus: { [key: string]: number };
    upcomingEvents: number;
    popularCategories: {
        categoryId: string;
        categoryName: string;
        count: number;
    }[];
}


const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0); 
    const [totalUserCount, setTotalUserCount] = useState(0); // Đổi tên để tránh nhầm lẫn
    const [eventStats, setEventStats] = useState<EventStatistics | null>(null);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | User['status']>('all'); 
    const [filterRole, setFilterRole] = useState<'all' | User['role']>('all'); 

    const navigate = useNavigate();

    const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
    const [loadingPending, setLoadingPending] = useState(true);

    const fetchPendingEvents = useCallback(async (token: string) => {
        setLoadingPending(true);
        try {
             // Gọi API để lấy danh sách sự kiện có status=pending_approval
            const res = await fetch("http://localhost:8000/events/?status=pending_approval", {
                method: "GET",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorResult = await res.json();
                console.error(`Pending events failed: ${errorResult.message || res.statusText}`);
                setPendingEvents([]);
                return;
            }

            const result = await res.json();
            if (result.success) {
                const events: PendingEvent[] = (result.data?.events || []).map((event: any) => ({
                    id: event.id,
                    title: event.title,
                    organizerName: event.organizerName,
                    createdAt: event.createdAt,
                }));
                setPendingEvents(events);
            } else {
                console.error(result.message || "Failed to fetch pending events.");
                setPendingEvents([]);
            }
        } catch (err) {
            console.error("Network error fetching pending events.", err);
            setPendingEvents([]);
        } finally {
            setLoadingPending(false);
        }
    }, []);

    const fetchEventStatistics = useCallback(async (token: string) => {
        setLoadingEvents(true);
        try {
            const res = await fetch("http://localhost:8000/events/admin/statistics", {
                method: "GET",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorResult = await res.json();
                setError(prev => (prev ? prev + " | " : "") + `Event stats failed: ${errorResult.message || res.statusText}`);
                setEventStats(null);
                return;
            }

            const result = await res.json();
            if (result.success) {
                setEventStats(result.data as EventStatistics);
                setError(null);
            } else {
                setError(prev => (prev ? prev + " | " : "") + (result.message || "Failed to fetch event data."));
                setEventStats(null);
            }
        } catch (err) {
            setError(prev => (prev ? prev + " | " : "") + "Network error fetching event statistics.");
            setEventStats(null);
        } finally {
            setLoadingEvents(false);
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('accessToken'); 
        if (!token) { 
            setError("Token not found. Vui lòng đăng nhập lại."); 
            setLoading(false); 
            setLoadingEvents(false);
            setLoadingPending(false);
            return; 
        }

        // 1. Fetch Users (Logic không thay đổi nhiều, chỉ cập nhật state totalUserCount)
        try {
            const res = await fetch("http://localhost:8000/users/", {
                method: "GET",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });
            
            if (!res.ok) {
                const errorResult = await res.json();
                setError(errorResult.message || `Failed to fetch users (HTTP ${res.status}).`);
                setTotalUserCount(0);
            } else {
                const result = await res.json();
                if (result.success) {
                    const usersArray = result.data.users || [];
                    const processedUsers = usersArray.map((user: any) => {
                        let determinedStatus: User['status'] = 'active';
                        if (typeof user.isLocked === 'boolean') {
                            determinedStatus = user.isLocked ? 'inactive' : 'active';
                        } else if (user.status) {
                            determinedStatus = user.status.toLowerCase() === 'active' ? 'active' : 'inactive';
                        }
                        return {
                            ...user,
                            status: determinedStatus, 
                            role: (user.roleName || user.role || 'user').toLowerCase() === 'admin' ? 'admin' : ((user.roleName || user.role || 'user').toLowerCase() === 'event_manager' ? 'event_manager' : 'user'),
                            authId: user.authId || user.id, 
                        };
                    }) as User[];
                    
                    setUsers(processedUsers);
                    const totalFromBackend = result.data?.total; 
                    setTotalUserCount(totalFromBackend ?? processedUsers.length);
                    // Không xóa error ở đây để giữ lại lỗi từ Event Stats nếu có
                } else {
                    setError(result.message || "Failed to fetch user data.");
                    setTotalUserCount(0);
                }
            }
        } catch (err) {
            setError(prev => (prev ? prev + " | " : "") + "Network error fetching user data.");
            setTotalUserCount(0);
        } finally {
            setLoading(false);
        }
        
        // 2. Fetch Event Statistics
        await fetchEventStatistics(token);

        await fetchPendingEvents(token);

    }, [fetchEventStatistics, fetchPendingEvents]); 

    useEffect(() => {
        fetchData();
    }, [refreshKey, fetchData]); 

    const kpis = useMemo(() => [
        { title: "Total Users", value: totalUserCount.toLocaleString(), icon: FaUsers, color: COLORS.PRIMARY },
        { title: "Total Events", value: (eventStats?.totalEvents ?? 0).toLocaleString(), icon: FaCalendarAlt, color: COLORS.SECONDARY }, // Sửa KPI
        { title: "Upcoming Events", value: (eventStats?.upcomingEvents ?? 0).toLocaleString(), icon: FaTicketAlt, color: COLORS.SUCCESS_ACCENT }, // Sửa KPI
        { title: "Total Managers", value: users.filter(u => u.role === 'event_manager').length.toLocaleString(), icon: FaShieldAlt, color: COLORS.WARNING }, // Lấy từ users state
    ], [totalUserCount, eventStats, users]);


    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role'); 
        navigate("/admin/login");
    };

    const handleRefresh = useCallback(() => {
        setRefreshKey(prevKey => prevKey + 1);
        setLoading(true);
        setLoadingEvents(true);
        setLoadingPending(true);
        setError(null); 
        setActionMessage(null); 
    }, []);


    const filteredUsers = useMemo(() => {
        let currentUsers = users;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentUsers = currentUsers.filter(user => 
                user.fullName.toLowerCase().includes(lowerCaseSearchTerm) ||
                user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
                user.username.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        if (filterStatus !== 'all') {
            currentUsers = currentUsers.filter(user => user.status === filterStatus);
        }

        if (filterRole !== 'all') {
            currentUsers = currentUsers.filter(user => user.role === filterRole);
        }

        return currentUsers;

    }, [users, searchTerm, filterStatus, filterRole]); 


    useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => setActionMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [actionMessage]);


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

        const endpoint = `http://localhost:8000/auth/${userAuthId}/${action}`;
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
                            ? { ...u, status: action === 'lock' ? 'inactive' : 'active' } 
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


    // ... (Hàm ViewInfo và Helper Styles không đổi) ...
    const [isViewInfoOpen, setIsViewInfoOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Hàm mở Modal
    const handleViewInfo = (userId: string) => {
        setSelectedUserId(userId);
        setIsViewInfoOpen(true);
    };

    // Hàm đóng Modal
    const handleCloseViewInfo = () => {
        setIsViewInfoOpen(false);
        setSelectedUserId(null);
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

    // RENDER LOGIC CHO BẢNG NGƯỜI DÙNG (Không đổi)
    const renderUserTable = () => {
        if (loading && users.length === 0) return <p style={{ textAlign: 'center', padding: '20px', color: COLORS.TEXT_SECONDARY }}>Loading users...</p>;
        if (error && users.length === 0) return <p style={{ color: COLORS.DANGER, textAlign: 'center', padding: '20px' }}>Error fetching data: {error}</p>;
        // SỬ DỤNG filteredUsers ở đây:
        if (filteredUsers.length === 0 && (searchTerm || filterStatus !== 'all' || filterRole !== 'all')) {
            return <p style={{ textAlign: 'center', padding: '20px', color: COLORS.TEXT_SECONDARY }}>No users found matching your criteria.</p>;
        }
        if (users.length === 0 && !loading && !error) return <p style={{ textAlign: 'center', padding: '20px', color: COLORS.TEXT_SECONDARY }}>No users found.</p>;


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
                        {filteredUsers.map((user) => ( // <<< DÙNG filteredUsers
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
                                        onClick={() => handleViewInfo(user.id)} // Gọi hàm mở Modal với userId
                                        title="View User Info"
                                        style={{...styles.actionButton, color: COLORS.DARK_NAVY, marginRight: '10px'}}
                                    >
                                        <FaInfoCircle size={14} /> 
                                    </button>
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


    // RENDER LOGIC MỚI CHO EVENT STATISTICS
    const renderEventStatistics = () => {
        if (loadingEvents && !eventStats) return <p style={{ textAlign: 'center', padding: '20px', color: COLORS.TEXT_SECONDARY }}>Loading event statistics...</p>;
        if (!eventStats) return <p style={{ color: COLORS.DANGER, textAlign: 'center', padding: '20px' }}>Could not load event statistics.</p>;

        const statusKeys = Object.keys(eventStats.byStatus);
        const totalEvents = eventStats.totalEvents;

        return (
            <div style={styles.eventStatsGrid}>
                
                {/* 1. Thống kê theo trạng thái */}
                <div style={styles.statCard}>
                    <h4 style={styles.statCardTitle}><FaChartPie size={16} style={{marginRight: '8px'}}/> Events by Status</h4>
                    <ul style={styles.statusList}>
                        {statusKeys.map(status => {
                            const count = eventStats.byStatus[status];
                            const percentage = totalEvents > 0 ? ((count / totalEvents) * 100).toFixed(1) : 0;
                            const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

                            return (
                                <li key={status} style={styles.statusItem}>
                                    <span style={{...styles.statusDot, backgroundColor: EVENT_STATUS_COLORS[status]}}></span>
                                    <span style={styles.statusName}>{statusDisplay}</span>
                                    <span style={styles.statusCount}>
                                        {count} <span style={styles.statusPercentage}>({percentage}%)</span>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* 2. Danh mục phổ biến */}
                <div style={styles.statCard}>
                    <h4 style={styles.statCardTitle}><FaTags size={16} style={{marginRight: '8px'}}/> Popular Categories</h4>
                    <ul style={styles.categoryList}>
                        {eventStats.popularCategories.length > 0 ? (
                            eventStats.popularCategories
                                .sort((a, b) => b.count - a.count)
                                .slice(0, 5) // Chỉ hiển thị top 5
                                .map((cat, index) => (
                                    <li key={cat.categoryId} style={styles.categoryItem}>
                                        <span style={{...styles.categoryRank, backgroundColor: index === 0 ? COLORS.WARNING : COLORS.BORDER, color: index === 0 ? COLORS.DARK_NAVY : COLORS.TEXT_SECONDARY}}>
                                            #{index + 1}
                                        </span>
                                        <span style={styles.categoryName}>{cat.categoryName}</span>
                                        <span style={styles.categoryCount}>{cat.count} Events</span>
                                    </li>
                                ))
                        ) : (
                            <p style={styles.noDataText}>No popular categories found.</p>
                        )}
                    </ul>
                </div>
            </div>
        );
    }


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
            
            {/* Sidebar (Không đổi) */}
            <div style={styles.sidebar}>
                <h2 style={styles.logo}>Kindle</h2>
                <div style={styles.navSectionTitle}>MENU</div>
                
                <div style={styles.navItemActive}>
                    <FaChevronRight size={10} style={{ marginRight: '15px' }} />
                    Dashboard
                </div>
                
                <div style={styles.navItem}>
                    <FaUsers size={14} style={{ marginRight: '15px' }} />
                    User Management
                </div>
                <div 
                style={styles.navItem} 
                    onClick={() => navigate("/admin/event-approvals")} 
                >
                    <FaCalendarAlt size={14} style={{ marginRight: '15px' }} />
                    Event Approvals
                </div>
                <div style={styles.navItem}>
                    <FaShieldAlt size={14} style={{ marginRight: '15px' }} />
                    System Settings
                </div>
                <div 
                    style={{...styles.navItem, marginTop: '30px', color: COLORS.DARK_NAVY, fontWeight: '600'}}
                    onClick={handleLogout} 
                >
                    <FaArrowAltCircleLeft size={14} style={{ marginRight: '15px' }} /> 
                    Log Out
                </div>
                
            </div>



            {/* Main Content */}
            <div style={styles.mainContent}>
{/*                 <div style={styles.headerRow}>
                    <h1 style={styles.mainTitle}>Admin Dashboard</h1>
                    <PendingEventsNotification
                            pendingCount={eventStats?.byStatus['pending_approval'] ?? 0}
                            pendingEvents={pendingEvents}
                            onActionSuccess={handleRefresh}
                            token={localStorage.getItem('accessToken') || ''}
                            loadingPending={loadingPending} // <<< THÊM PROP NÀY
                        />
                    <button 
                        style={styles.refreshButton}
                        onClick={handleRefresh}
                        disabled={loading || loadingEvents}
                        title="Refresh Data"
                    >
                        <FaSync size={14} style={{ marginRight: '8px' }} className={(loading || loadingEvents) ? 'spin' : ''}/> 
                        {(loading || loadingEvents) ? 'Refreshing...' : 'Refresh'}
                    </button>
                
                </div> */}
                <div style={styles.headerRow}>
                    <h1 style={styles.mainTitle}>Admin Dashboard</h1>
                    {/* <<< NHÓM CÁC ACTIONS VÀO ĐÂY >>> */}
                    <div style={styles.headerActions}>
                        <PendingEventsNotification
                            pendingCount={eventStats?.byStatus['pending_approval'] ?? 0}
                            pendingEvents={pendingEvents}
                            onActionSuccess={handleRefresh}
                            token={localStorage.getItem('accessToken') || ''}
                            loadingPending={loadingPending}
                        />
                        <button 
                            style={styles.refreshButton}
                            onClick={handleRefresh}
                            disabled={loading || loadingEvents}
                            title="Refresh Data"
                        >
                            <FaSync size={14} style={{ marginRight: '8px' }} className={(loading || loadingEvents) ? 'spin' : ''}/> 
                            {(loading || loadingEvents) ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>
                <p style={styles.mainSubtitle}>System statistics and user administration.</p>
                
                {/* Action Message Bar */}
                {actionMessage && (
                    <div style={{...styles.actionMessageBar, ...getActionMessageStyle()}}>
                        {actionMessage.text}
                    </div>
                )}

                {/* 1. KPI Cards (ĐÃ CẬP NHẬT) */}
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

                {/* 2. EVENT STATISTICS SECTION (PHẦN MỚI) */}
                <h3 style={{...styles.dataCardTitle, marginTop: '10px'}}><FaClipboardList size={20} style={{marginRight: '10px', color: COLORS.PRIMARY}}/> Event Statistics</h3>
                {renderEventStatistics()}


                {/* 3. User Management Table (Bảng Người Dùng) */}
                <div style={{...styles.dataCard, marginTop: '40px'}}>
                    <h3 style={styles.dataCardTitle}>
                        <FaUsers size={20} style={{marginRight: '10px', color: COLORS.PRIMARY}}/> User Management
                    </h3>
                    
                    {/* Table Toolbar (Không đổi) */}
                    <div style={styles.tableToolbar}>
                        <div style={styles.searchWrapper}>
                            <FaSearch style={styles.searchIcon} />
                            <input 
                                type="text" 
                                placeholder="Search by name, email, or username..." 
                                style={styles.searchBar} 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div style={styles.filterGroup}> 
                            {/* Bộ lọc theo Status */}
                            <select 
                                style={styles.selectFilter} 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as 'all' | User['status'])}
                            >
                                <option value="all">Status: All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            
                            {/* Bộ lọc theo Role */}
                            <select 
                                style={styles.selectFilter} 
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value as 'all' | User['role'])}
                            >
                                <option value="all">Role: All</option>
                                <option value="admin">Admin</option>
                                <option value="event_manager">Event Manager</option>
                                <option value="user">User</option>
                            </select>

                            <button style={styles.filterButton}>
                                <FaFilter style={{marginRight: '5px'}}/> Filter
                            </button>
                        </div>
                    </div>

                    {renderUserTable()}
                </div>
                
            </div>
          {isViewInfoOpen && selectedUserId && (
                <AdminViewInfo 
                    userId={selectedUserId}
                    onClose={handleCloseViewInfo}
                />
            )}
        </div>
    );
};

// --- STYLES (ĐÃ CẬP NHẬT/THÊM MỚI) ---
const styles: DashboardStyles = {
    // ... (Giữ nguyên các styles cũ)
    
    // LAYOUT & CHUNG
    dashboardContainer: {
        display: 'flex', minHeight: '100vh', width: '100vw', fontFamily: 'Roboto, Arial, sans-serif', backgroundColor: COLORS.BACKGROUND,
    },
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
    mainContent: {
        flexGrow: 1, padding: '30px 40px', backgroundColor: COLORS.BACKGROUND, overflowY: 'auto',
    },
//     headerRow: { 
//         display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px',
//     },
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
    headerRow: { 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px',
    },
    headerActions: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px', 
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

    // EVENT STATS (MỚI)
    eventStatsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
    },
    statCard: {
        backgroundColor: COLORS.CARD_BG, 
        padding: '30px', 
        borderRadius: '4px', 
        border: `1px solid ${COLORS.BORDER}`,
    },
    statCardTitle: {
        fontSize: '16px', 
        fontWeight: '600', 
        color: COLORS.DARK_NAVY, 
        marginBottom: '20px',
        display: 'flex', 
        alignItems: 'center',
        borderBottom: `1px solid ${COLORS.BORDER}`,
        paddingBottom: '10px',
    },

    // Thống kê theo Status
    statusList: {
        listStyle: 'none', 
        padding: 0, 
        margin: 0
    },
    statusItem: {
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 0', 
        borderBottom: `1px dotted ${COLORS.BORDER}`,
        fontSize: '14px',
    },
    statusDot: {
        width: '10px', 
        height: '10px', 
        borderRadius: '50%', 
        marginRight: '10px',
        flexShrink: 0
    },
    statusName: {
        flexGrow: 1, 
        color: COLORS.DARK_NAVY,
        fontWeight: '500',
    },
    statusCount: {
        fontWeight: '600', 
        color: COLORS.PRIMARY,
    },
    statusPercentage: {
        color: COLORS.TEXT_SECONDARY,
        fontWeight: '400',
        marginLeft: '5px',
    },

    // Danh mục phổ biến
    categoryList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    categoryItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: `1px dotted ${COLORS.BORDER}`,
    },
    categoryRank: {
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '700',
        marginRight: '15px',
        minWidth: '40px',
        textAlign: 'center',
    },
    categoryName: {
        flexGrow: 1,
        color: COLORS.DARK_NAVY,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    categoryCount: {
        fontWeight: '600',
        color: COLORS.SECONDARY,
        fontSize: '13px',
    },
    noDataText: {
        textAlign: 'center', 
        color: COLORS.TEXT_SECONDARY, 
        padding: '20px 0', 
        margin: 0
    },


    // DATA TABLE & TOOLBAR (Không đổi)
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
        padding: '10px 15px 10px 40px', width: '100%', border: `1px solid ${COLORS.BORDER}`, borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',backgroundColor: COLORS.WHITE,color: COLORS.DARK_NAVY,
    },
    searchIcon: {
        position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: COLORS.TEXT_SECONDARY, fontSize: '14px',
    },
    filterButton: {
        padding: '10px 20px', backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center', transition: 'background-color 0.2s',
    },
    
    filterGroup: {
        display: 'flex', alignItems: 'center',
    },
    selectFilter: {
        padding: '10px 15px', border: `1px solid ${COLORS.BORDER}`, borderRadius: '4px', fontSize: '14px', marginRight: '15px', color: COLORS.DARK_NAVY, minWidth: '150px',
        backgroundColor: COLORS.CARD_BG, cursor: 'pointer'
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
    
    // STATUS BADGES & ACTIONS (Không đổi)
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
    },
    actionButton: {
        backgroundColor: COLORS.CARD_BG, // Hoặc COLORS.WHITE
        border: `1px solid ${COLORS.BORDER}`, 
        borderRadius: '4px', // Bo góc nhẹ
        padding: '8px',
        
        cursor: 'pointer',
        transition: 'opacity 0.2s, background-color 0.2s',
    },
};

export default AdminDashboard;