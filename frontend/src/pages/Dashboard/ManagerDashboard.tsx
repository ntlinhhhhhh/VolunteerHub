import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaCalendarCheck, FaChartLine, FaClipboardList, FaUsers, FaUser, FaPlus, FaSignOutAlt, FaEye, FaEdit, FaTrash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

// --- BẢNG MÀU ĐỒNG BỘ VỚI LOGIN ---
const COLORS = {
    PRIMARY: '#1A73E8', // Màu Xanh Google/Accent chính
    DARK_NAVY: '#202124', // Màu chữ đậm
    BACKGROUND: '#F8F9FA', // Nền siêu sáng
    CARD_BG: '#FFFFFF', // Nền Card
    BORDER: '#EBEBEB', // Đường viền mỏng
    TEXT_SECONDARY: '#5F6368', // Màu chữ phụ
    DANGER: '#EA4335', // Đỏ (Error)
    SUCCESS_ACCENT: '#34A853', // Xanh Lá (Success)
    WARNING: '#FBC02D', // Vàng (Warning)
    WHITE: '#FFFFFF',
};

// --- Định nghĩa Interface Category ---
interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
}

// --- Dữ liệu mô phỏng Sự kiện QUẢN LÝ ---
interface ManagerEvent {
    id: number;
    title: string;
    status: 'Draft' | 'Published' | 'Archived';
    registrations: number;
    capacity: number;
    startDate: string;
    endDate: string;
    categoryId: string; // Thêm ID Category
}

interface UserData {
    id: string;
    email: string;
    username: string;
    fullName: string | null;
    phoneNumber: string | null;
    avatar: string | null;
    address: string | null;
    bio: string | null;
    dateOfBirth: string | null;
}

// Dữ liệu mock được cập nhật để sử dụng Category ID từ API bạn cung cấp
const mockManagerEvents: ManagerEvent[] = [
    { id: 101, title: 'Annual Tech Summit (Mock)', status: 'Published', registrations: 150, capacity: 200, startDate: '2026-03-10', endDate: '2026-03-12', categoryId: '6935a50f1a51c72418085e9e' }, // Education
    { id: 102, title: 'Local Cleanup Drive (Mock)', status: 'Draft', registrations: 0, capacity: 50, startDate: '2026-04-05', endDate: '2026-04-05', categoryId: '6935a50f1a51c72418085e99' }, // Environment
    { id: 103, title: 'Charity Run 5K (Mock)', status: 'Published', registrations: 450, capacity: 500, startDate: '2026-05-20', endDate: '2026-05-20', categoryId: '6935a50f1a51c72418085ea3' }, // Healthcare
    { id: 104, title: 'Animal Shelter Day (Mock)', status: 'Archived', registrations: 30, capacity: 30, startDate: '2025-11-01', endDate: '2025-11-30', categoryId: '6935a50f1a51c72418085eb0' }, // Animal Welfare
];


// --- Component Chính Dashboard ---
const ManagerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<'overview' | 'my_events' | 'profile'>('my_events');
    const [user, setUser] = useState<UserData | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showMenu, setShowMenu] = useState(false);

    // STATE CHO PROFILE UPDATE
    const [formData, setFormData] = useState<any>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);

    // Dùng useMemo để tạo Map Categories giúp tra cứu nhanh
    const categoryMap = useMemo(() => {
        return categories.reduce((map, category) => {
            map.set(category.id, category);
            return map;
        }, new Map<string, Category>());
    }, [categories]);


    // --- HÀM FETCH CATEGORIES ---
    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:8000/categories?activeOnly=true");
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

    // --- HÀM FETCH USER PROFILE ---
    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        const defaultAvatarUrl = 'http://localhost:8000/uploads/avatars/default.png';

        if (!token) {
            navigate("/manager/login");
            return;
        }
        
        try {
            const res = await fetch("http://localhost:8000/users/me", { headers: { Authorization: `Bearer ${token}` } });
            
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
                ? (userData.avatar.startsWith('http') ? userData.avatar : `http://localhost:8000${userData.avatar}`)
                : defaultAvatarUrl;

            const dob = userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '';

            setUser(userData); 
            setFormData({
                fullName: userData.fullName || '',
                username: userData.username || '',
                phoneNumber: userData.phoneNumber || '',
                bio: userData.bio || '',
                dateOfBirth: dob, 
                avatar: userData.avatar,
            });

        } catch (err) {
            console.error("Failed to fetch user:", err);
        }
    }, [navigate]);

    useEffect(() => {
        fetchUserProfile();
        fetchCategories(); // Gọi API lấy Categories khi component mount
    }, [fetchUserProfile, fetchCategories]);


    // --- HÀM XỬ LÝ UPDATE PROFILE ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setUpdateMessage(null);
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsUpdating(true);
        setUpdateMessage(null);

        const token = localStorage.getItem("accessToken");
        if (!token) {
            setUpdateMessage("Authentication failed. Please log in again.");
            setIsUpdating(false);
            return;
        }

        try {
            const bodyData = {
                fullName: formData.fullName,
                username: formData.username,
                phoneNumber: formData.phoneNumber,
                bio: formData.bio,
                dateOfBirth: formData.dateOfBirth, 
                avatar: formData.avatar, 
            };

            const res = await fetch("http://localhost:8000/users/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(bodyData),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                const updatedData = result.data;
                const updatedDob = updatedData.dateOfBirth ? updatedData.dateOfBirth.split('T')[0] : '';
                updatedData.avatar = updatedData.avatar.startsWith('http') ? updatedData.avatar : `http://localhost:8000${updatedData.avatar}`;

                setUser(updatedData); 
                setFormData({
                    ...formData,
                    fullName: updatedData.fullName || '',
                    username: updatedData.username || '',
                    phoneNumber: updatedData.phoneNumber || '',
                    bio: updatedData.bio || '',
                    dateOfBirth: updatedDob,
                    avatar: updatedData.avatar,
                });
                setUpdateMessage("🚀 Profile updated successfully!");
            } else {
                setUpdateMessage(`Error: ${result.message || "Failed to update profile."}`);
            }
        } catch (error) {
            setUpdateMessage("Network error. Could not connect to the server.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    // --- HÀM LOGOUT ---
    const handleLogout = () => {
        localStorage.removeItem("accessToken"); 
        localStorage.removeItem("refreshToken"); 
        localStorage.removeItem("role"); 
        navigate("/manager/login");
    };

    // --- HÀM XỬ LÝ CRUD SỰ KIỆN (Chỉ là giả lập) ---
    const handleViewEvent = (id: number) => alert(`Viewing Event ID: ${id}`);
    const handleEditEvent = (id: number) => alert(`Editing Event ID: ${id}`);
    const handleDeleteEvent = (id: number) => {
        if (window.confirm(`Are you sure you want to delete Event ID: ${id}?`)) {
            alert(`Event ID: ${id} deleted (Mock).`);
        }
    };
    const handleCreateEvent = () => alert("Redirecting to Create New Event page...");
    

    // Hàm lấy style cho Status tag
    const getStatusStyle = (status: ManagerEvent['status']): React.CSSProperties => {
        switch (status) {
            case 'Published':
                return { ...styles.statusTag, backgroundColor: '#E6F4EA', color: COLORS.SUCCESS_ACCENT, border: `1px solid ${COLORS.SUCCESS_ACCENT}` };
            case 'Draft':
                return { ...styles.statusTag, backgroundColor: '#F0F7FF', color: COLORS.PRIMARY, border: `1px solid ${COLORS.PRIMARY}` };
            case 'Archived':
                return { ...styles.statusTag, backgroundColor: '#FCE8E6', color: COLORS.DANGER, border: `1px solid ${COLORS.DANGER}` };
            default:
                return styles.statusTag;
        }
    };

    // Hàm lấy Category Icon và Name
    const getCategoryInfo = (categoryId: string) => {
        const category = categoryMap.get(categoryId);
        if (category) {
            return (
                <span style={{ color: category.color, fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                    {category.icon} {category.name}
                </span>
            );
        }
        return <span style={{ color: COLORS.TEXT_SECONDARY }}>? Unknown Category</span>;
    };


    // --- RENDER CONTENT DỰA TRÊN activeSection ---
    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <>
                        <h1 style={styles.contentTitle}>Dashboard Overview</h1>
                        <p style={styles.contentSubtitle}>Key metrics for your managed events.</p>
                        <div style={styles.kpiGrid}>
                            <div style={styles.kpiCard}>
                                <FaCalendarCheck size={30} style={{ color: COLORS.PRIMARY }} />
                                <h3 style={styles.kpiTitle}>Total Events</h3>
                                <p style={styles.kpiValue}>{mockManagerEvents.length}</p>
                            </div>
                            <div style={styles.kpiCard}>
                                <FaUsers size={30} style={{ color: COLORS.SUCCESS_ACCENT }} />
                                <h3 style={styles.kpiTitle}>Total Registrations</h3>
                                <p style={styles.kpiValue}>
                                    {mockManagerEvents.reduce((sum, event) => sum + event.registrations, 0)}
                                </p>
                            </div>
                            <div style={styles.kpiCard}>
                                <FaChartLine size={30} style={{ color: COLORS.WARNING }} />
                                <h3 style={styles.kpiTitle}>Published Events</h3>
                                <p style={styles.kpiValue}>
                                    {mockManagerEvents.filter(e => e.status === 'Published').length}
                                </p>
                            </div>
                        </div>
                        <div style={{...styles.profileFormCard, marginTop: '30px'}}>
                            <h2 style={{...styles.contentTitle, fontSize: '20px', marginBottom: '15px'}}>Event Categories List</h2>
                            <p style={styles.contentSubtitle}>Active categories fetched from API:</p>
                            
                            {categories.length > 0 ? (
                                <ul style={styles.categoryList}>
                                    {categories.map(cat => (
                                        <li key={cat.id} style={{...styles.categoryListItem, borderLeft: `5px solid ${cat.color}`}}>
                                            <span style={{ fontSize: '20px', marginRight: '10px' }}>{cat.icon}</span>
                                            <div>
                                                <span style={{ fontWeight: '600', color: cat.color }}>{cat.name}</span> 
                                                <span style={{ color: COLORS.TEXT_SECONDARY, fontSize: '12px', marginLeft: '10px' }}>({cat.id})</span>
                                                <p style={{ margin: '0', fontSize: '13px', color: COLORS.DARK_NAVY, opacity: 0.8 }}>{cat.description}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: COLORS.DANGER }}>Loading categories or none found...</p>
                            )}
                        </div>
                    </>
                );

            case 'my_events':
                return (
                    <>
                        <div style={styles.headerWithButton}>
                            <div >
                                <h1 style={styles.contentTitle}>My Events</h1>
                                <p style={styles.contentSubtitle}>Manage and edit the events you are responsible for.</p>
                            </div>
                            <button onClick={handleCreateEvent} style={styles.createButton}>
                                <FaPlus style={{ marginRight: '8px' }} /> Create New Event
                            </button>
                        </div>

                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.tableHeader}>Title</th>
                                        <th style={styles.tableHeader}>Category</th> {/* Thêm cột Category */}
                                        <th style={styles.tableHeader}>Status</th>
                                        <th style={styles.tableHeader}>Dates</th>
                                        <th style={styles.tableHeader}>Registrations</th>
                                        <th style={styles.tableHeader}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockManagerEvents.map(event => (
                                        <tr key={event.id} style={styles.tableRow}>
                                            <td style={styles.tableCell}>{event.title}</td>
                                            <td style={styles.tableCell}>
                                                {getCategoryInfo(event.categoryId)}
                                            </td> {/* Hiển thị Category */}
                                            <td style={styles.tableCell}>
                                                <span style={getStatusStyle(event.status)}>{event.status}</span>
                                            </td>
                                            <td style={styles.tableCell}>{event.startDate} to {event.endDate}</td>
                                            <td style={styles.tableCell}>{event.registrations} / {event.capacity}</td>
                                            <td style={styles.tableCellActions}>
                                                <button onClick={() => handleViewEvent(event.id)} title="View Details" style={{...styles.actionButton, color: COLORS.PRIMARY, marginRight: '8px'}}>
                                                    <FaEye size={14} />
                                                </button>
                                                <button onClick={() => handleEditEvent(event.id)} title="Edit Event" style={{...styles.actionButton, color: COLORS.WARNING, marginRight: '8px'}}>
                                                    <FaEdit size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteEvent(event.id)} title="Delete Event" style={{...styles.actionButton, color: COLORS.DANGER}}>
                                                    <FaTrash size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                );

            case 'profile':
                return (
                    <div style={styles.profileContainer}>
                        <h1 style={styles.contentTitle}>My Profile</h1>
                        <p style={styles.contentSubtitle}>Manage your personal information and contact details.</p>

                        <div style={styles.profileFormCard}>
                            {/* AVATAR */}
                            <div style={{...styles.formGroup, textAlign: 'center', marginBottom: '30px'}}>
                                <img 
                                    src={formData.avatar || 'http://localhost:8000/uploads/avatars/default.png'} 
                                    alt="User Avatar" 
                                    style={styles.profileAvatar}
                                />
                                <label style={styles.label}>Avatar URL</label>
                                <input 
                                    name="avatar" 
                                    value={formData.avatar || ''} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter Avatar URL"
                                    style={styles.input} 
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email (Manager ID)</label>
                                <input value={user?.email || ''} disabled style={{ ...styles.input, background: "#f0f0f0" }} /> 
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input 
                                    name="fullName" 
                                    value={formData.fullName} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Username</label>
                                <input 
                                    name="username" 
                                    value={formData.username} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone Number</label>
                                <input 
                                    name="phoneNumber" 
                                    value={formData.phoneNumber} 
                                    onChange={handleInputChange} 
                                    type="tel"
                                    style={styles.input} 
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Date of Birth</label>
                                <input 
                                    name="dateOfBirth" 
                                    value={formData.dateOfBirth} 
                                    onChange={handleInputChange} 
                                    type="date" 
                                    style={styles.input} 
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Bio</label>
                                <textarea 
                                    name="bio" 
                                    value={formData.bio} 
                                    onChange={handleInputChange} 
                                    style={styles.textarea} 
                                />
                            </div>

                            {/* Thông báo cập nhật */}
                            {updateMessage && (
                                <p style={{
                                    ...styles.messageStyle,
                                    color: updateMessage.includes("successfully") ? COLORS.SUCCESS_ACCENT : COLORS.DANGER, 
                                    backgroundColor: updateMessage.includes("successfully") ? '#E6F4EA' : '#FCE8E6',
                                    border: `1px solid ${updateMessage.includes("successfully") ? COLORS.SUCCESS_ACCENT : COLORS.DANGER}`,
                                }}>
                                    {updateMessage.includes("successfully") ? <FaCheckCircle style={{marginRight: '8px'}}/> : <FaExclamationTriangle style={{marginRight: '8px'}}/> }
                                    {updateMessage.replace("🚀 ", "")}
                                </p>
                            )}

                            <button 
                                onClick={handleUpdateProfile} 
                                disabled={isUpdating}
                                style={{...styles.saveButton, opacity: isUpdating ? 0.7 : 1}}
                            >
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                );
            
            default:
                return <div style={{ padding: '20px' }}><h2>Select a section from the sidebar.</h2></div>;
        }
    };
    
    return (
        <div style={styles.dashboardContainer}>
            {/* --- SIDEBAR --- */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarTitle}>Event Manager</div>
                <div style={styles.sidebarSubtitle}>{user?.email || 'Loading...'}</div>

                <div style={styles.navItemContainer}>
                    <div style={{ ...styles.navItem, ...(activeSection === 'overview' ? styles.navItemSelected : {}) }} onClick={() => setActiveSection('overview')}>
                        <FaChartLine style={styles.navIcon} /> Overview
                    </div>
                    <div style={{ ...styles.navItem, ...(activeSection === 'my_events' ? styles.navItemSelected : {}) }} onClick={() => setActiveSection('my_events')}>
                        <FaClipboardList style={styles.navIcon} /> My Events
                    </div>
                    <div style={{ ...styles.navItem, ...(activeSection === 'profile' ? styles.navItemSelected : {}) }} onClick={() => setActiveSection('profile')}>
                        <FaUser style={styles.navIcon} /> My Profile
                    </div>
                    <div style={{ ...styles.navItem, color: COLORS.TEXT_SECONDARY, marginTop: '20px' }} onClick={handleLogout}>
                        <FaSignOutAlt style={styles.navIcon} /> Logout
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div style={styles.contentMain}>
                {/* Top Bar (Simplified) */}
                <div style={styles.topBar}>
                    <div></div> 
                    {user && (
                        <div style={styles.userBox} onClick={() => setShowMenu(!showMenu)}>
                            <img src={formData.avatar || 'http://localhost:8000/uploads/avatars/default.png'} alt="avatar" style={styles.avatar} />
                            <span style={styles.userName}>{user.email}</span>
                            {showMenu && (
                                <div style={styles.dropdown}>
                                    <div style={styles.dropdownItem} onClick={() => setActiveSection("profile")}>Profile</div>
                                    <div style={styles.dropdownItem} onClick={handleLogout}>Logout</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Nội dung chính */}
                {renderContent()}

            </div>
        </div>
    );
};

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    dashboardContainer: {
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        backgroundColor: COLORS.BACKGROUND,
        fontFamily: 'Roboto, Arial, sans-serif',
        overflow: 'hidden',
    },

    // Sidebar
    sidebar: {
        width: '280px', 
        minWidth: '280px',
        backgroundColor: COLORS.WHITE,
        padding: '30px 0',
        borderRight: `1px solid ${COLORS.BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
    },
    sidebarTitle: {
        fontSize: '24px',
        fontWeight: '500', 
        color: COLORS.DARK_NAVY,
        padding: '0 30px',
        marginBottom: '5px',
    },
    sidebarSubtitle: {
        fontSize: '13px',
        color: COLORS.TEXT_SECONDARY,
        marginBottom: '40px',
        padding: '0 30px',
    },
    navItemContainer: { padding: '0' },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '14px 30px',
        cursor: 'pointer',
        color: COLORS.DARK_NAVY,
        fontSize: '15px',
        fontWeight: '500',
        transition: 'all 0.2s',
        marginBottom: '2px',
        borderLeft: '4px solid transparent',
        opacity: 0.85,
    },
    navItemSelected: {
        backgroundColor: '#f0f7ff',
        color: COLORS.PRIMARY,
        fontWeight: '600',
        borderLeft: `4px solid ${COLORS.PRIMARY}`,
        opacity: 1,
    },
    navIcon: { marginRight: '12px', fontSize: '18px' },

    // Content
    contentMain: {
        flexGrow: 1,
        padding: '30px 40px',
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: COLORS.BACKGROUND,
        boxSizing: 'border-box',
    },
    topBar: {
        width: "100%",
        display: "flex",
        justifyContent: "flex-end", 
        marginBottom: 30,
        height: '40px',
        alignItems: 'center',
    },
    userBox: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "4px 10px",
        background: COLORS.CARD_BG,
        border: `1px solid ${COLORS.BORDER}`,
        borderRadius: 20,
        cursor: "pointer",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        transition: "0.2s",
    },
    avatar: { width: 32, height: 32, borderRadius: "50%", objectFit: "cover" },
    userName: { fontSize: 14, color: COLORS.DARK_NAVY, fontWeight: '500' },

    dropdown: {
        position: "absolute",
        top: "45px",
        right: "0",
        backgroundColor: COLORS.CARD_BG,
        color: COLORS.DARK_NAVY,
        padding: "5px",
        borderRadius: "8px",
        minWidth: "140px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        zIndex: 999,
        border: `1px solid ${COLORS.BORDER}`,
    },
    dropdownItem: {
        padding: "10px 15px",
        cursor: "pointer",
        color: COLORS.DARK_NAVY,
        fontSize: "14px",
        borderRadius: "6px",
        transition: "0.2s",
    },

    contentTitle: { fontSize: '26px', fontWeight: '500', color: COLORS.DARK_NAVY, marginBottom: '8px', marginTop: 0 },
    contentSubtitle: { fontSize: '15px', color: COLORS.TEXT_SECONDARY, marginBottom: '20px', marginTop: 0 },

    // KPI Grid
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    kpiCard: { 
        backgroundColor: COLORS.CARD_BG, 
        borderRadius: '12px', 
        padding: '25px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
        border: `1px solid ${COLORS.BORDER}`,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
    },
    kpiTitle: { fontSize: '15px', color: COLORS.TEXT_SECONDARY, margin: '15px 0 5px 0', fontWeight: '500' },
    kpiValue: { fontSize: '32px', fontWeight: '700', color: COLORS.DARK_NAVY, margin: 0 },

    // Category List Styles
    categoryList: {
        listStyle: 'none',
        padding: '0',
        margin: '0',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px'
    },
    categoryListItem: {
        padding: '15px',
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: '8px',
        border: `1px solid ${COLORS.BORDER}`,
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },

    // Header Actions
    headerWithButton: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' },
    createButton: {
        display: 'flex', alignItems: 'center', padding: '12px 20px',
        backgroundColor: COLORS.PRIMARY, color: COLORS.CARD_BG,
        border: 'none', borderRadius: '8px', cursor: 'pointer',
        fontSize: '15px', fontWeight: '500',
        transition: 'background-color 0.2s',
    },

    // Table Styles
    tableContainer: { 
        backgroundColor: COLORS.CARD_BG, 
        borderRadius: '12px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
        overflowX: 'auto',
        border: `1px solid ${COLORS.BORDER}`,
    },
    table: { 
        width: '100%', borderCollapse: 'collapse', 
    },
    tableHeader: {
        textAlign: 'left', padding: '15px 20px',
        fontSize: '14px', fontWeight: '600',
        color: COLORS.TEXT_SECONDARY,
        borderBottom: `1px solid ${COLORS.BORDER}`,
        backgroundColor: COLORS.BACKGROUND,
    },
    tableRow: {
        borderBottom: `1px solid ${COLORS.BORDER}`,
        transition: 'background-color 0.1s',
    },
    tableCell: {
        padding: '15px 20px', fontSize: '14px', color: COLORS.DARK_NAVY,
        fontWeight: '400',
    },
    tableCellActions: {
        padding: '10px 20px',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '5px',
    },
    actionButton: {
        background: 'none', 
        border: 'none', 
        cursor: 'pointer',
        padding: '5px',
        transition: 'opacity 0.2s',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
    },
    statusTag: {
        padding: '4px 10px',
        borderRadius: '15px',
        fontSize: '12px',
        fontWeight: '600',
    },

    // PROFILE STYLES
    profileContainer: {
        maxWidth: '700px', 
        paddingBottom: '50px',
    },
    profileFormCard: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: `1px solid ${COLORS.BORDER}`,
    },
    profileAvatar: {
        width: '80px', 
        height: '80px', 
        borderRadius: '50%', 
        objectFit: 'cover', 
        marginBottom: '15px', 
        border: `3px solid ${COLORS.BORDER}`
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
        color: COLORS.TEXT_SECONDARY,
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '10px 15px',
        fontSize: '15px',
        borderRadius: '8px',
        border: `1px solid ${COLORS.BORDER}`,
        backgroundColor: COLORS.CARD_BG,
        color: COLORS.DARK_NAVY,
        outline: 'none',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '10px 15px',
        fontSize: '15px',
        borderRadius: '8px',
        border: `1px solid ${COLORS.BORDER}`,
        backgroundColor: COLORS.CARD_BG,
        color: COLORS.DARK_NAVY,
        outline: 'none',
        minHeight: '100px',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box',
    },
    saveButton: {
        backgroundColor: COLORS.PRIMARY,
        color: COLORS.CARD_BG,
        padding: '12px 20px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer',
        marginTop: '10px',
        width: '100%',
        transition: 'background-color 0.2s',
    },
    messageStyle: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        borderRadius: '8px',
        fontWeight: '500',
        marginBottom: '15px',
        fontSize: '14px',
    }
};

export default ManagerDashboard;