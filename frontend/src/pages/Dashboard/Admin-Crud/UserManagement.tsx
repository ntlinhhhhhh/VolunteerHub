import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaUsers, FaCalendarAlt, FaShieldAlt, FaFilter, FaLock, FaUnlock, FaSearch, FaChevronRight, FaArrowAltCircleLeft, FaInfoCircle, FaUserPlus, FaSync, FaHouseUser } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import AdminViewInfo from './AdminViewInfo';
import CreateManagerModal from './CreateManagerModal';

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
    WARNING: '#F7B200', 
    INFO: '#4CB7A5', 
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
    status: 'active' | 'inactive'; 
    createdAt: string;
}

const UserManagement: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | User['status']>('all');
    const [filterRole, setFilterRole] = useState<'all' | User['role']>('all');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isViewInfoOpen, setIsViewInfoOpen] = useState(false);
    const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const fetchData = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch("http://localhost:8000/users/", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const result = await res.json();
            if (result.success) {
                const processed = (result.data.users || []).map((user: any) => ({
                    ...user,
                    status: user.isLocked ? 'inactive' : 'active',
                    role: (user.roleName || user.role || 'user').toLowerCase(),
                    authId: user.authId || user.id,
                }));
                setUsers(processed);
            }
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const toggleUserStatus = async (userAuthId: string, currentStatus: User['status']) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        
        const action = currentStatus === 'active' ? 'lock' : 'unlock';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        setLoading(true);
        try {
            const endpoint = `http://localhost:8000/auth/${userAuthId}/${action}`;
            const res = await fetch(endpoint, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
                body: action === 'lock' ? JSON.stringify({ reason: "Admin action" }) : undefined
            });

            if (res.ok) {
                setActionMessage({ type: 'success', text: `Successfully ${action}ed user!` });
                setUsers(prev => prev.map(u => 
                    u.authId === userAuthId ? { ...u, status: action === 'lock' ? 'inactive' : 'active' } : u
                ));
            } else {
                const result = await res.json();
                setActionMessage({ type: 'error', text: result.message || "Operation failed" });
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: "Network error occurred" });
        } finally {
            setLoading(false);
            setTimeout(() => setActionMessage(null), 3000);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 user.username.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
            const matchesRole = filterRole === 'all' || user.role === filterRole;
            return matchesSearch && matchesStatus && matchesRole;
        });
    }, [users, searchTerm, filterStatus, filterRole]);

    const getRoleStyle = (role: string) => {
        if (role === 'admin') return styles.roleAdmin;
        if (role === 'event_manager') return styles.roleManager;
        return styles.roleUser;
    };

    return (
        <div style={styles.dashboardContainer}>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>

            <div style={styles.sidebar}>
                <h2 style={styles.logo}>Kindle</h2>
                <div style={styles.navSectionTitle}>MENU</div>
                
                <div style={styles.navItem} onClick={() => navigate("/admin/dashboard")}>
                    <FaHouseUser size={14} style={{ marginRight: '15px'}} /> 
                    Dashboard
                </div>
                
                <div style={styles.navItemActive}> 
                    <FaChevronRight size={14} style={{ marginRight: '15px' }} />
                    User Management
                </div>
                
                <div style={styles.navItem} onClick={() => navigate("/admin/event-approvals")}>
                    <FaCalendarAlt size={14} style={{ marginRight: '15px'}} />
                    Event Approvals
                </div>

                <div style={styles.navItem}>
                    <FaShieldAlt size={14} style={{ marginRight: '15px' }} />
                    System Settings
                </div>

                <div 
                    style={{...styles.navItem, marginTop: '30px', color: COLORS.DARK_NAVY, fontWeight: '600'}}
                    onClick={() => {
                        localStorage.clear();
                        navigate("/admin/login");
                    }} 
                >
                    <FaArrowAltCircleLeft size={14} style={{ marginRight: '15px' }} /> 
                    Log Out
                </div>
            </div>

            <div style={styles.mainContent}>
                <div style={styles.headerRow}>
                    <h1 style={styles.mainTitle}>
                        <FaUsers size={28} style={{marginRight: '10px', color: COLORS.PRIMARY}}/> User Management
                    </h1>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button style={styles.refreshButton} onClick={fetchData} disabled={loading}>
                            <FaSync size={14} style={{ marginRight: '8px' }} className={loading ? 'spin' : ''}/> 
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                        {/* <button style={styles.createButton} onClick={() => navigate("/admin/create-user")}>
                            <FaUserPlus style={{marginRight: '8px'}}/> Add New Manager
                        </button> */}
                        <button style={styles.createButton} onClick={() => setIsCreateModalOpen(true)}>
                            <FaUserPlus style={{marginRight: '8px'}}/> Add New Manager
                        </button>
                    </div>
                </div>
                <p style={styles.mainSubtitle}>Full administration of system users and permissions.</p>

                {actionMessage && (
                    <div style={{
                        ...styles.actionMessageBar, 
                        backgroundColor: actionMessage.type === 'success' ? '#E6F4EA' : '#FDE7E7',
                        color: actionMessage.type === 'success' ? COLORS.SUCCESS_ACCENT : COLORS.DANGER,
                        border: `1px solid ${actionMessage.type === 'success' ? COLORS.SUCCESS_ACCENT : COLORS.DANGER}`
                    }}>
                        {actionMessage.text}
                    </div>
                )}

                <div style={styles.dataCard}>
                    <div style={styles.tableToolbar}>
                        <div style={styles.searchWrapper}>
                            <FaSearch style={styles.searchIcon} />
                            <input 
                                type="text" 
                                placeholder="Search by name, email or username..." 
                                style={styles.searchBar} 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <select style={styles.selectFilter} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <select style={styles.selectFilter} value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)}>
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="event_manager">Manager</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{...styles.th, width: '30%'}}>User Info</th>
                                    <th style={{...styles.th, width: '20%'}}>Username</th>
                                    <th style={{...styles.th, width: '15%'}}>Role</th> 
                                    <th style={{...styles.th, width: '15%'}}>Status</th>
                                    <th style={{...styles.th, width: '20%', textAlign: 'center'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{fontWeight: '500'}}>{user.fullName || 'N/A'}</div>
                                            <div style={{fontSize: '12px', color: COLORS.TEXT_SECONDARY}}>{user.email}</div>
                                        </td>
                                        <td style={styles.td}>{user.username}</td>
                                        <td style={styles.td}>
                                            <span style={getRoleStyle(user.role)}>{user.role.toUpperCase()}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={user.status === 'active' ? styles.statusActive : styles.statusLocked}>
                                                {user.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{...styles.td, textAlign: 'center'}}>
                                            <button 
                                                onClick={() => { setSelectedUserId(user.id); setIsViewInfoOpen(true); }}
                                                style={styles.iconActionButton}
                                                title="View Details"
                                            >
                                                <FaInfoCircle size={18} color={COLORS.PRIMARY}/> 
                                            </button>
                                            
                                            <button 
                                                style={user.status === 'active' ? styles.lockButton : styles.unlockButton}
                                                onClick={() => toggleUserStatus(user.authId, user.status)}
                                                disabled={user.role === 'admin' || loading}
                                                title={user.status === 'active' ? "Lock User" : "Unlock User"}
                                            >
                                                {user.status === 'active' ? <FaLock size={14} /> : <FaUnlock size={14} />}
                                                {/* <span style={{marginLeft: '5px'}}>{user.status === 'active' ? 'Lock' : 'Unlock'}</span> */}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isViewInfoOpen && selectedUserId && (
                <AdminViewInfo 
                    userId={selectedUserId}
                    onClose={() => setIsViewInfoOpen(false)}
                />
            )}
            {isCreateModalOpen && (
                <CreateManagerModal 
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={(msg) => {
                        setActionMessage({ type: 'success', text: msg });
                        fetchData(); 
                    }}
                />
            )}
        </div>
    );
};

const styles: DashboardStyles = {
    dashboardContainer: { display: 'flex', minHeight: '100vh', width: '100vw', fontFamily: 'Roboto, Arial, sans-serif', backgroundColor: COLORS.BACKGROUND },
    sidebar: { width: '240px', backgroundColor: COLORS.CARD_BG, color: COLORS.DARK_NAVY, padding: '20px 0', borderRight: `1px solid ${COLORS.BORDER}`, flexShrink: 0 },
    logo: { fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', padding: '0 25px', color: COLORS.DARK_NAVY },
    navSectionTitle: { fontSize: '11px', fontWeight: '500', color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 25px 5px', marginTop: '10px' },
    navItem: { display: 'flex', alignItems: 'center', padding: '10px 25px', cursor: 'pointer', fontSize: '14px', color: COLORS.TEXT_SECONDARY, transition: 'background-color 0.2s' },
    navItemActive: { display: 'flex', alignItems: 'center', padding: '10px 25px', cursor: 'default', fontWeight: '500', fontSize: '14px', backgroundColor: '#E8F0FE', color: COLORS.PRIMARY, borderRight: `3px solid ${COLORS.PRIMARY}` },
    mainContent: { flexGrow: 1, padding: '30px 40px', backgroundColor: COLORS.BACKGROUND, overflowY: 'auto' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' },
    mainTitle: { fontSize: '28px', fontWeight: '400', color: COLORS.DARK_NAVY, margin: 0, display: 'flex', alignItems: 'center' },
    mainSubtitle: { fontSize: '15px', color: COLORS.TEXT_SECONDARY, marginBottom: '30px' },
    refreshButton: { padding: '8px 15px', backgroundColor: COLORS.CARD_BG, color: COLORS.TEXT_SECONDARY, border: `1px solid ${COLORS.BORDER}`, borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center' },
    createButton: { padding: '8px 15px', backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center' },
    actionMessageBar: { padding: '15px', borderRadius: '4px', marginBottom: '20px', fontWeight: '500', fontSize: '15px', textAlign: 'center' },
    dataCard: { backgroundColor: COLORS.CARD_BG, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '30px', marginBottom: '30px' },
    tableToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    searchWrapper: { display: 'flex', alignItems: 'center', position: 'relative', flexGrow: 1, marginRight: '20px', maxWidth: '400px' },
    searchBar: { padding: '10px 10px 10px 40px', border: `1px solid ${COLORS.BORDER}`, borderRadius: '4px', width: '100%', fontSize: '14px' , backgroundColor: '#FFFFFF', color: '#000000'},
    searchIcon: { position: 'absolute', left: '15px', color: COLORS.TEXT_SECONDARY, fontSize: '16px' },
    selectFilter: { padding: '8px 12px', borderRadius: '4px', border: `1px solid ${COLORS.BORDER}`, backgroundColor: COLORS.WHITE, color: COLORS.TEXT_SECONDARY, fontSize: '13px' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    th: { backgroundColor: COLORS.BACKGROUND, color: COLORS.TEXT_SECONDARY, fontWeight: '600', padding: '15px', textAlign: 'left', borderBottom: `2px solid ${COLORS.BORDER}`, fontSize: '12px', textTransform: 'uppercase' },
    td: { padding: '15px', borderBottom: `1px solid ${COLORS.BORDER}`, color: COLORS.DARK_NAVY, fontSize: '14px', wordBreak: 'break-word' },
    tr: { transition: 'background-color 0.2s' },
    statusActive: { padding: '4px 8px', borderRadius: '4px', backgroundColor: '#E6F4EA', color: COLORS.SUCCESS_ACCENT, fontSize: '11px', fontWeight: 400 },
    statusLocked: { padding: '4px 8px', borderRadius: '4px', backgroundColor: '#FDE7E7', color: COLORS.DANGER, fontSize: '11px', fontWeight: 400 },
    roleAdmin: { padding: '4px 8px', borderRadius: '4px', backgroundColor: '#FEF7E0', color: COLORS.WARNING, fontSize: '11px', fontWeight: 400 },
    roleManager: { padding: '4px 8px', borderRadius: '4px', backgroundColor: '#E8F0FE', color: COLORS.PRIMARY, fontSize: '11px', fontWeight: 400 },
    roleUser: { padding: '4px 8px', borderRadius: '4px', backgroundColor: '#F1F3F4', color: COLORS.TEXT_SECONDARY, fontSize: '11px', fontWeight: 400 },
    iconActionButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px', verticalAlign: 'middle' },
    lockButton: { padding: '6px 12px', backgroundColor: COLORS.DANGER, color: COLORS.WHITE, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', marginLeft: '10px' },
    unlockButton: { padding: '6px 12px', backgroundColor: COLORS.SUCCESS_ACCENT, color: COLORS.WHITE, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', marginLeft: '10px' },
};

export default UserManagement;