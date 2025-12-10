import React, { useEffect, useState, useCallback } from "react";
import { FaCompass, FaChartBar, FaCalendarAlt, FaSearch, FaFilter, FaUser, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

// --- Định nghĩa COLORS (Cần có để các styles hoạt động) ---
const COLORS = {
    PRIMARY: '#007bff',
    SECONDARY: '#6c757d',
    SUCCESS: '#28a745',
    DANGER: '#dc3545',
    WARNING: '#ffc107',
    INFO: '#17a2b8',
    LIGHT: '#f8f9fa',
    DARK: '#343a40',
    WHITE: '#ffffff',
    BACKGROUND: '#f8f9fa',
    CARD_BG: '#ffffff',
    BORDER: '#e9ecef',
    TEXT_SECONDARY: '#adb5bd',
    DARK_NAVY: '#202124',
    SUCCESS_ACCENT: '#34A853',
};

// --- Dữ liệu mới: Category Interface ---
interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string; // Sử dụng icon làm biểu tượng/ảnh thay thế
    color: string; // Có thể dùng color làm màu nền/viền
    order: number;
    isActive: boolean;
}

// --- Dữ liệu mô phỏng sự kiện (Đã loại bỏ) ---
// interface Event { ... }
// const mockEvents: Event[] = [ ... ];

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

// --- Component Thẻ Category (Thay thế EventCard) ---
const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
    // Ánh xạ dữ liệu Category sang hiển thị giống EventCard
    // name -> title, description -> location/meta, icon/color -> visual
    return (
        <div style={{ ...styles.eventCard, borderColor: category.color }}>
            <div style={{ 
                ...styles.categoryImageWrapper,
                backgroundColor: category.color,
                color: COLORS.WHITE
            }}>
                <span style={styles.categoryIcon}>{category.icon}</span>
                <span style={styles.categoryNameTag}>{category.name}</span>
            </div>
            <div style={styles.eventCardContent}>
                <h3 style={styles.eventCardTitle}>{category.name}</h3>
                <div style={styles.eventCardMeta}>
                    <p style={styles.eventMetaItem}><FaCompass style={{ marginRight: '5px' }} /> Slug: {category.slug}</p>
                    <p style={styles.eventMetaItemSmall}>{category.description}</p>
                </div>
                {/* Có thể giữ lại hoặc loại bỏ thanh progress bar/thông tin sức chứa */}
                <div style={{ ...styles.progressBarContainer, paddingTop: '10px', borderTop: `1px solid ${COLORS.BORDER}` }}>
                    <span style={styles.progressBarText}>Status: {category.isActive ? 'Active' : 'Inactive'}</span>
                </div>
            </div>
        </div>
    );
};

// --- Component Chính Dashboard ---
const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<'overview' | 'browse' | 'insights' | 'profile'>('browse');
    const [user, setUser] = useState<UserData | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    // STATE MỚI CHO CATEGORIES
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // STATE CHO UPDATE PROFILE
    const [formData, setFormData] = useState<any>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);


    // HÀM LẤY DỮ LIỆU CATEGORIES
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // API endpoint cho Category
            const res = await fetch("http://localhost:8000/categories?activeOnly=true", {
                headers: { 
                    'Accept': 'application/json' 
                } 
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const result = await res.json();
            
            if (result && result.success && Array.isArray(result.data)) {
                setCategories(result.data as Category[]);
            } else {
                setError("Invalid response format.");
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
            setError("Failed to load categories. Please check the network and API endpoint.");
        } finally {
            setIsLoading(false);
        }
    }, []);


    // HÀM LẤY DỮ LIỆU PROFILE BAN ĐẦU (Giữ nguyên)
    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        const defaultAvatarUrl = 'http://localhost:8000/uploads/avatars/default.png';

        if (!token) {
            navigate("/login");
            return;
        }
        
        try {
            const res = await fetch("http://localhost:8000/users/me", { headers: { Authorization: `Bearer ${token}` } });
            
            if (res.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                navigate("/login");
                return;
            }
            
            const result = await res.json();
            
            if (!result || !result.success || !result.data) return;

            const userData = result.data;

            // Xử lý avatar
            userData.avatar = userData.avatar 
                ? (userData.avatar.startsWith('http') ? userData.avatar : `http://localhost:8000${userData.avatar}`)
                : defaultAvatarUrl;

            // Đặt các giá trị null thành chuỗi rỗng để form kiểm soát tốt hơn
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
        // Gọi hàm fetchCategories khi component được mount hoặc khi chuyển sang tab 'browse' lần đầu
        fetchCategories(); 
    }, [fetchUserProfile, fetchCategories]);


    // HÀM XỬ LÝ FORM INPUT (Giữ nguyên)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setUpdateMessage(null);
    };

    // HÀM XỬ LÝ UPDATE PROFILE (Giữ nguyên)
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
                // Cập nhật state user và form data với dữ liệu mới
                const updatedData = result.data;
                const updatedDob = updatedData.dateOfBirth ? updatedData.dateOfBirth.split('T')[0] : '';
                
                // Cập nhật URL avatar đầy đủ nếu API chỉ trả về path
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
    
    const handleLogout = () => {
        localStorage.removeItem("accessToken"); // Sửa thành accessToken
        localStorage.removeItem("refreshToken"); 
        navigate("/login");
    };

    return (
        <div style={styles.dashboardContainer}>
            {/* --- SIDEBAR --- */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarTitle}>VolunteerHub</div>
                <div style={styles.sidebarSubtitle}>Event Management</div>

                <div style={styles.navItemContainer}>
                    <div style={{ ...styles.navItem, ...(activeSection === 'overview' ? styles.navItemSelected : {}) }} onClick={() => setActiveSection('overview')}>
                        <FaCompass style={styles.navIcon} /> Overview
                    </div>
                    <div style={{ ...styles.navItem, ...(activeSection === 'browse' ? styles.navItemSelected : {}) }} onClick={() => setActiveSection('browse')}>
                        <FaCalendarAlt style={styles.navIcon} /> Browse Events
                    </div>
                    <div style={{ ...styles.navItem, ...(activeSection === 'insights' ? styles.navItemSelected : {}) }} onClick={() => setActiveSection('insights')}>
                        <FaChartBar style={styles.navIcon} /> Attendee Insights
                    </div>
                    <div style={{ ...styles.navItem, ...(activeSection === 'profile' ? styles.navItemSelected : {}) }} onClick={() => setActiveSection('profile')}>
                        <FaUser style={styles.navIcon} /> My Profile
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div style={styles.contentMain}>
                {/* Top Bar */}
                <div style={styles.topBar}>
                    <div></div> {/* Spacer */}
                    {user && (
                        <div style={styles.userBox} onClick={() => setShowMenu(!showMenu)}>
                            <img src={user.avatar || 'http://localhost:8000/uploads/avatars/default.png'} alt="avatar" style={styles.avatar} />
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

                {/* --- Nội dung thay đổi dựa trên activeSection --- */}

                {/* SECTION: BROWSE EVENTS (Bây giờ là BROWSE CATEGORIES) */}
                {activeSection === 'browse' && (
                    <>
                        <h1 style={styles.contentTitle}>Browse Event Categories</h1>
                        <p style={styles.contentSubtitle}>Discover active event categories to filter your searches</p>

                        <div style={styles.searchBarWrapper}>
                            <div style={styles.searchInputGroup}>
                                <FaSearch style={styles.searchIcon} />
                                <input type="text" placeholder="Search categories..." style={styles.searchInput} />
                            </div>
                            <button style={styles.filterButton}>
                                <FaFilter style={{ marginRight: '8px' }} /> Filters
                            </button>
                        </div>

                        {isLoading && <p style={styles.loadingMessage}>Loading categories...</p>}
                        {error && <p style={{...styles.loadingMessage, color: COLORS.DANGER}}><FaExclamationTriangle style={{marginRight: '8px'}}/> {error}</p>}
                        
                        {!isLoading && !error && categories.length === 0 && (
                            <p style={styles.loadingMessage}>No active categories found.</p>
                        )}

                        <div style={styles.eventGrid}>
                            {categories.map(category => <CategoryCard key={category.id} category={category} />)}
                        </div>
                    </>
                )}

                {/* SECTION: MY PROFILE */}
                {activeSection === 'profile' && (
                    <div style={styles.profileContainer}>
                        <h1 style={styles.contentTitle}>My Profile</h1>
                        <p style={styles.contentSubtitle}>Manage your personal information</p>

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

                            {/* Email (DISABLED) */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <input value={user?.email || ''} disabled style={{ ...styles.input, background: "#e9ecef" }} /> 
                            </div>

                            {/* Full Name */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input 
                                    name="fullName" 
                                    value={formData.fullName} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                />
                            </div>

                            {/* Username */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Username</label>
                                <input 
                                    name="username" 
                                    value={formData.username} 
                                    onChange={handleInputChange} 
                                    style={styles.input} 
                                />
                            </div>

                            {/* Phone Number */}
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

                            {/* Date of Birth */}
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

                            {/* Bio */}
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
                                    // Kiểm tra xem message bắt đầu bằng '🚀' (thành công) hay không
                                    color: updateMessage.includes("successfully") ? COLORS.SUCCESS : COLORS.DANGER, 
                                }}>
                                    {updateMessage.includes("successfully") ? <FaCheckCircle style={{marginRight: '8px'}}/> : <FaExclamationTriangle style={{marginRight: '8px'}}/> }
                                    {updateMessage.replace("🚀 ", "")}
                                </p>
                            )}

                            {/* Nút Save Changes */}
                            <button 
                                onClick={handleUpdateProfile} 
                                disabled={isUpdating}
                                style={{...styles.saveButton, opacity: isUpdating ? 0.7 : 1}}
                            >
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Các section khác */}
                {activeSection === 'overview' && <div style={{ padding: '20px' }}><h2>Overview Content</h2></div>}
                {activeSection === 'insights' && <div style={{ padding: '20px' }}><h2>Insights Content</h2></div>}
            </div>
        </div>
    );
};

// --- STYLES (Đã thêm style cho Category Card) ---
const styles: { [key: string]: React.CSSProperties } = {
    dashboardContainer: {
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        backgroundColor: COLORS.BACKGROUND,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        overflow: 'hidden',
    },

    // Sidebar (Giữ nguyên)
    sidebar: {
        width: '260px',
        minWidth: '260px',
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
        fontWeight: 'bold',
        color: COLORS.DARK,
        padding: '0 30px',
        marginBottom: '5px',
    },
    sidebarSubtitle: {
        fontSize: '14px',
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
        color: COLORS.SECONDARY,
        fontSize: '15px',
        fontWeight: '500',
        transition: 'all 0.2s',
        marginBottom: '2px',
        borderLeft: '4px solid transparent',
    },
    navItemSelected: {
        backgroundColor: '#f0f7ff',
        color: COLORS.PRIMARY,
        fontWeight: '600',
        borderLeft: `4px solid ${COLORS.PRIMARY}`,
        borderRight: 'none',
    },
    navIcon: { marginRight: '12px', fontSize: '18px' },

    // Content (Giữ nguyên)
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
        justifyContent: "space-between",
        marginBottom: 30,
        height: '50px',
        alignItems: 'center',
    },
    userBox: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "6px 12px",
        background: COLORS.WHITE,
        border: `1px solid ${COLORS.BORDER}`,
        borderRadius: 20,
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
        transition: "0.2s",
    },
    avatar: { width: 32, height: 32, borderRadius: "50%", objectFit: "cover" },
    userName: { fontSize: 14, color: COLORS.DARK, fontWeight: '500' },

    dropdown: {
        position: "absolute",
        top: "50px",
        right: "0",
        backgroundColor: COLORS.WHITE,
        color: COLORS.DARK,
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
        color: COLORS.DARK,
        fontSize: "14px",
        borderRadius: "6px",
        transition: "0.2s",
        // Thêm hover:
        // ':hover': { backgroundColor: '#f5f5f5' }
    },

    contentTitle: { fontSize: '28px', fontWeight: '700', color: COLORS.DARK, marginBottom: '8px', marginTop: 0 },
    contentSubtitle: { fontSize: '16px', color: COLORS.SECONDARY, marginBottom: '30px', marginTop: 0 },

    // Search Styles (Giữ nguyên)
    searchBarWrapper: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    searchInputGroup: { display: 'flex', alignItems: 'center', border: `1px solid ${COLORS.BORDER}`, borderRadius: '10px', padding: '10px 15px', backgroundColor: COLORS.WHITE, flexGrow: 1, marginRight: '20px', maxWidth: '450px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
    searchIcon: { color: COLORS.TEXT_SECONDARY, marginRight: '10px' },
    searchInput: { border: 'none', outline: 'none', fontSize: '15px', width: '100%', backgroundColor: 'transparent', color: COLORS.DARK },
    filterButton: { display: 'flex', alignItems: 'center', padding: '10px 20px', backgroundColor: COLORS.WHITE, color: COLORS.SECONDARY, border: `1px solid ${COLORS.BORDER}`, borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },

    // Event/Category Grid (Đã loại bỏ styles liên quan đến thanh progress bar không dùng)
    eventGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', paddingBottom: '40px' },
    eventCard: { backgroundColor: COLORS.WHITE, borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer', border: `1px solid ${COLORS.BORDER}` },
    
    // NEW: Category specific styles
    categoryImageWrapper: { 
        height: '160px', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative', 
        padding: '15px',
        borderBottom: `1px solid ${COLORS.BORDER}`
    },
    categoryIcon: {
        fontSize: '48px',
        marginBottom: '10px',
    },
    categoryNameTag: { 
        backgroundColor: 'rgba(0, 0, 0, 0.2)', 
        color: COLORS.WHITE, 
        padding: '4px 8px', 
        borderRadius: '4px', 
        fontSize: '12px', 
        fontWeight: '600', 
        position: 'absolute',
        top: '15px',
        right: '15px',
    },

    eventCardContent: { padding: '20px' },
    eventCardTitle: { fontSize: '17px', fontWeight: '700', marginBottom: '10px', color: COLORS.DARK, lineHeight: 1.4 },
    eventCardMeta: { marginBottom: '15px' },
    eventMetaItem: { display: 'flex', alignItems: 'center', marginBottom: '6px', fontSize: '13px', color: COLORS.SECONDARY },
    eventMetaItemSmall: { marginTop: '8px', fontSize: '12px', color: COLORS.TEXT_SECONDARY, fontWeight: '500' },
    progressBarContainer: { marginTop: '15px' },
    progressBarBack: { height: '6px', backgroundColor: COLORS.BORDER, borderRadius: '3px', overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: COLORS.PRIMARY, borderRadius: '3px' },
    progressBarText: { fontSize: '12px', color: COLORS.TEXT_SECONDARY, marginTop: '6px', display: 'block', textAlign: 'right' },
    loadingMessage: { 
        fontSize: '16px', 
        color: COLORS.SECONDARY, 
        padding: '20px', 
        textAlign: 'center', 
        backgroundColor: COLORS.LIGHT,
        borderRadius: '10px',
    },


    // --- PROFILE STYLES (Giữ nguyên) ---
    profileContainer: {
        maxWidth: '800px', 
        paddingBottom: '50px',
    },
    profileFormCard: {
        backgroundColor: COLORS.WHITE,
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        border: `1px solid ${COLORS.BORDER}`,
    },
    profileAvatar: {
        width: '100px', 
        height: '100px', 
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
        fontSize: '14px',
        fontWeight: '600',
        color: COLORS.SECONDARY,
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '15px',
        borderRadius: '8px',
        border: `1px solid ${COLORS.BORDER}`,
        backgroundColor: COLORS.WHITE,
        color: COLORS.DARK,
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '15px',
        borderRadius: '8px',
        border: `1px solid ${COLORS.BORDER}`,
        backgroundColor: COLORS.WHITE,
        color: COLORS.DARK,
        outline: 'none',
        minHeight: '120px',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box',
    },
    saveButton: {
        backgroundColor: COLORS.DARK,
        color: COLORS.WHITE,
        padding: '14px 24px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '10px',
        width: '100%',
        transition: 'background-color 0.2s',
        // Thêm hover:
        // ':hover': { backgroundColor: '#495057' }
    },
    messageStyle: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        borderRadius: '8px',
        fontWeight: '600',
        backgroundColor: COLORS.LIGHT,
        marginBottom: '15px',
    }
};

export default Dashboard;