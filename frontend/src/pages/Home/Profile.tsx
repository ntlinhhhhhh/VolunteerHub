import React, { useState, useRef, useEffect } from 'react';
import {
    Camera, Mail, Phone, MapPin, Calendar,
    Edit2, Save, X, User, Loader2,
    LayoutDashboard, Search, Users, UserCircle, Bell, Menu, ChevronLeft
} from 'lucide-react';

const Profile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [userData, setUserData] = useState<any>(null);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        fullName: "",
        phoneNumber: "",
        avatar: "",
        address: "",
        bio: "",
        dateOfBirth: "",
    });
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const logoutPopupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUserProfile();

        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(false);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showLogoutPopup && logoutPopupRef.current && !logoutPopupRef.current.contains(event.target as Node)) {
                setShowLogoutPopup(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showLogoutPopup]);

    const fetchUserProfile = async () => {
        try {
            setPageLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:8000/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch profile');
            const result = await response.json();
            const data = result.data || result;

            setUserData(data);
            setFormData({
                email: data.email || "",
                username: data.username || "",
                fullName: data.fullName || "",
                phoneNumber: data.phoneNumber || "",
                avatar: data.avatar ? (data.avatar.startsWith('http') ? data.avatar : `http://localhost:8000${data.avatar}`) : "",
                address: data.address || "",
                bio: data.bio || "",
                dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "",
            });
        } catch (error) {
            console.error(error);
        } finally {
            setPageLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };


    const handleSave = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No token found');

            let isAnyUpdateSuccess = false;

            if (avatarFile && userData?.id) {
                const fd = new FormData();
                fd.append('file', avatarFile);

                const uploadRes = await fetch(`http://localhost:8000/users/${userData.id}/avatar`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: fd
                });

                if (uploadRes.ok) {
                    isAnyUpdateSuccess = true;
                    console.log("Avatar updated successfully");
                } else {
                    console.error("Failed to update avatar");
                }
            }

            const updateBody = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                bio: formData.bio,
                dateOfBirth: formData.dateOfBirth,
            };

            const response = await fetch('http://localhost:8000/users/me', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateBody)
            });

            if (response.ok) {
                isAnyUpdateSuccess = true;
                console.log("Profile information updated");
            }

            if (isAnyUpdateSuccess) {
                setIsEditing(false);
                setAvatarFile(null);
                setAvatarPreview(null);
                await fetchUserProfile();
                alert('Cập nhật thành công!');
            }

        } catch (error) {
            console.error("Error during save:", error);
            alert('Có lỗi xảy ra trong quá trình lưu thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const closeSidebar = () => setSidebarOpen(false);

    if (pageLoading) return (
        <div style={styles.loadingFull}>
            <Loader2 style={{ ...styles.spinner, animation: 'spin 1s linear infinite' }} size={48} />
        </div>
    );

    return (
        <div style={styles.layout}>
            {/* Overlay for mobile */}
            {sidebarOpen && isMobile && (
                <div style={styles.overlay} onClick={closeSidebar} />
            )}

            {/* Sidebar */}
            <aside style={{
                ...styles.sidebar,
                ...(isMobile ? (sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed) : {})
            }}>
                <div style={styles.sidebarHeader}>
                    <div>
                        <h1 style={styles.brandTitle}>
                            VolunteerHub
                        </h1>
                    </div>
                    {isMobile && (
                        <button style={styles.closeBtn} onClick={closeSidebar}>
                            <ChevronLeft size={24} />
                        </button>
                    )}
                </div>

                <nav style={styles.navMenu}>
                    <SidebarLink icon={<LayoutDashboard size={20} />} label="Overview" />
                    <SidebarLink icon={<Search size={20} />} label="Browse Events" />
                    <SidebarLink icon={<Users size={20} />} label="Attendee Insights" />
                    <SidebarLink icon={<UserCircle size={20} />} label="My Profile" active />
                </nav>

                <div style={styles.sidebarFooter}>
                    <div style={{ position: 'relative' }} ref={logoutPopupRef}>
                        {showLogoutPopup && (
                            <div style={styles.userDropdown}>
                                <div style={styles.dropdownHeader}>Profile</div>
                                <div
                                    style={styles.dropdownItem}
                                    onClick={handleLogout}
                                >
                                    <span style={{ color: '#EF4444', fontWeight: '600' }}>Logout</span>
                                </div>
                            </div>
                        )}
                        <div className="user-card-hover" style={styles.userCard} onClick={() => setShowLogoutPopup(!showLogoutPopup)}>
                            <img
                                src={avatarPreview || formData.avatar || "https://ui-avatars.com/api/?name=User"}
                                style={styles.sidebarAvatar}
                                alt="avatar"
                            />
                            <div style={styles.userInfo}>
                                <p style={styles.userName}>{formData.fullName || 'User Name'}</p>
                                <p style={styles.userEmail}>{formData.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.mainContent}>
                <header style={styles.topHeader}>
                    <div style={styles.headerLeft}>
                        {isMobile && (
                            <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
                                <Menu size={24} />
                            </button>
                        )}
                        <div>
                            <h2 style={styles.headerTitle}>My Profile</h2>
                            <p style={styles.headerSub}>Manage your personal information</p>
                        </div>
                    </div>
                    <div style={styles.headerRight}>
                        <button style={styles.iconBtn}>
                            <Bell size={20} />
                        </button>
                        {!isMobile && (
                            <div style={styles.userProfileMini}>
                                <span style={styles.miniEmail}>{formData.email}</span>
                                <img
                                    src={avatarPreview || formData.avatar || "https://ui-avatars.com/api/?name=User"}
                                    style={styles.miniAvatar}
                                    alt="mini-avatar"
                                />
                            </div>
                        )}
                    </div>
                </header>

                <div style={styles.scrollArea}>
                    <div style={styles.card}>
                        {/* Avatar Section */}
                        <div style={styles.avatarZone}>

                            <div
                                style={{
                                    ...styles.avatarBlurBg,
                                    backgroundImage: `url(${avatarPreview || formData.avatar || "https://ui-avatars.com/api/?name=User"})`
                                }}
                            />

                            <div style={styles.avatarOverlay} />

                            <div style={styles.avatarWrapper}>
                                <img
                                    src={avatarPreview || formData.avatar || `http://localhost:8000/uploads/avatars/default.png`}
                                    style={styles.mainAvatar}
                                    alt="Avatar"
                                />
                                {isEditing && (
                                    <button
                                        type="button"
                                        style={styles.cameraBtn}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera size={22} color="#FFF" />
                                    </button>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </div>

                        </div>

                        <div style={styles.formPadding}>
                            <div style={styles.formGrid}>
                                <InputItem
                                    label="Email Address"
                                    icon={<Mail size={18} />}
                                    value={formData.email}
                                    disabled
                                />
                                <InputItem
                                    label="Username"
                                    icon={<UserCircle size={18} />}
                                    value={formData.username}
                                    disabled
                                />
                                <InputItem
                                    label="Full Name"
                                    name="fullName"
                                    icon={<User size={18} />}
                                    value={formData.fullName}
                                    editing={isEditing}
                                    onChange={handleInputChange}
                                />
                                <InputItem
                                    label="Phone Number"
                                    name="phoneNumber"
                                    icon={<Phone size={18} />}
                                    value={formData.phoneNumber}
                                    editing={isEditing}
                                    onChange={handleInputChange}
                                />
                                <InputItem
                                    label="Date of Birth"
                                    name="dateOfBirth"
                                    icon={<Calendar size={18} />}
                                    type="date"
                                    value={formData.dateOfBirth}
                                    editing={isEditing}
                                    onChange={handleInputChange}
                                />
                                <InputItem
                                    label="Address"
                                    name="address"
                                    icon={<MapPin size={18} />}
                                    value={formData.address}
                                    editing={isEditing}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div style={styles.bioGroup}>
                                <label style={styles.fieldLabel}>
                                    <Edit2 size={16} style={{ marginRight: 8 }} />
                                    Personal Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    style={isEditing ? styles.textarea : styles.textareaDisabled}
                                    placeholder="Tell us about yourself and why you love volunteering..."
                                />
                            </div>

                            <div style={styles.cardFooter}>
                                {!isEditing ? (
                                    <button style={styles.primaryBtn} onClick={() => setIsEditing(true)}>
                                        <Edit2 size={18} style={{ marginRight: 8 }} />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div style={styles.buttonGroup}>
                                        <button style={styles.saveBtn} onClick={handleSave} disabled={loading}>
                                            {loading ? (
                                                <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} />
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            <span style={{ marginLeft: 8 }}>Save Changes</span>
                                        </button>
                                        <button
                                            style={styles.cancelBtn}
                                            onClick={() => {
                                                setIsEditing(false);
                                                setAvatarPreview(null);
                                                fetchUserProfile();
                                            }}
                                        >
                                            <X size={18} style={{ marginRight: 8 }} />
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                input[type="date"]::-webkit-calendar-picker-indicator {
                    cursor: pointer;
                    filter: invert(0.5);
                }
            `}</style>
        </div>
    );
};

// --- Sub-Components ---
const SidebarLink = ({ icon, label, active = false }: any) => (
    <div style={active ? styles.navItemActive : styles.navItem}>
        <span style={styles.navIcon}>{icon}</span>
        <span style={styles.navLabel}>{label}</span>
    </div>
);

const InputItem = ({ label, value, editing, onChange, name, disabled, type = "text", icon }: any) => (
    <div style={styles.inputGroup}>
        <label style={styles.fieldLabel}>
            <span style={styles.labelIcon}>{icon}</span>
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled || !editing}
            style={disabled ? styles.inputLocked : (editing ? styles.inputEditing : styles.inputReadonly)}
        />
    </div>
);

// --- CSS-in-JS Styles ---
const styles: { [key: string]: React.CSSProperties } = {
    layout: {
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#F8FAFC',
        color: '#1E293B',
        position: 'relative',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        zIndex: 90,
        backdropFilter: 'blur(4px)',
        transition: 'all 0.3s ease'
    },
    sidebar: {
        width: '280px',
        backgroundColor: '#FFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        height: '100vh',
        flexShrink: 0,
        overflowY: 'auto'
    },
    sidebarOpen: {
        position: 'fixed',
        left: 0,
        top: 0,
        transform: 'translateX(0)',
    },
    sidebarClosed: {
        position: 'fixed',
        left: 0,
        top: 0,
        transform: 'translateX(-100%)'
    },
    sidebarHeader: {
        padding: '32px 24px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    brandTitle: {
        letterSpacing: '-1px',
        fontSize: "24px",
        fontWeight: "bold",
        color: "#343a40",
        marginBottom: "5px",
        margin: 0,
    },
    brandSub: {
        fontSize: '11px',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginTop: '4px',
        fontWeight: '700'
    },
    closeBtn: {
        background: '#F1F5F9',
        border: 'none',
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748B'
    },
    navMenu: {
        flex: 1,
        padding: '24px 16px'
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        color: '#64748B',
        cursor: 'pointer',
        borderRadius: '14px',
        marginBottom: '4px',
        fontSize: '15px',
        fontWeight: '500',
        transition: 'all 0.2s ease'
    },
    navItemActive: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        color: '#007bff',
        backgroundColor: '#F0F7FF',
        fontWeight: '700',
        borderRadius: '14px',
        marginBottom: '4px',
        fontSize: '15px',
        boxShadow: '0 2px 10px rgba(0, 123, 255, 0.08)'
    },
    navIcon: { marginRight: '12px', display: 'flex' },
    sidebarFooter: {
        padding: '20px',
        borderTop: '1px solid #F1F5F9',
        marginTop: 'auto'
    },
    userCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#F8FAFC',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
    },
    userDropdown: {
        position: 'absolute',
        bottom: 'calc(100% + 10px)', // Luôn nằm trên userCard 10px
        left: '0',
        right: '0',
        backgroundColor: '#FFF',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        border: '1px solid #E2E8F0',
        padding: '8px',
        zIndex: 1000,
    },
    dropdownHeader: {
        padding: '8px 12px',
        fontSize: '11px',
        fontWeight: '800',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    dropdownItem: {
        padding: '10px 12px',
        fontSize: '14px',
        borderRadius: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.2s ease',
    },
    sidebarAvatar: {
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #FFF',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    },
    userInfo: { flex: 1, minWidth: 0 },
    userName: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#1E293B',
        margin: 0,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    },
    userEmail: {
        fontSize: '12px',
        color: '#94A3B8',
        margin: 0,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
        position: 'relative',
        minWidth: 0
    },
    topHeader: {
        height: '80px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 80
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
    headerTitle: { fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 },
    headerSub: { fontSize: '14px', color: '#64748B', margin: 0 },
    menuBtn: {
        background: '#F1F5F9',
        border: 'none',
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#475569',
        padding: 0
    },
    headerRight: { display: 'flex', alignItems: 'center', gap: '20px' },
    iconBtn: {
        background: '#FFF',
        border: '1px solid #E2E8F0',
        color: '#64748B',
        cursor: 'pointer',
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        padding: 0
    },
    userProfileMini: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingLeft: '20px',
        borderLeft: '1px solid #E2E8F0'
    },
    miniEmail: { fontSize: '14px', color: '#475569', fontWeight: '600' },
    miniAvatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F1F5F9' },
    scrollArea: { padding: '40px 24px', maxWidth: '1000px', margin: '0 auto', width: '100%' },
    card: {
        backgroundColor: '#FFF',
        borderRadius: '32px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden'
    },
    avatarZone: {
        position: 'relative',
        padding: '60px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#F0F9FF',
    },
    avatarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 2,
    },
    avatarBlurBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(5px)',
        transform: 'scale(1.2)',
        zIndex: 1,
    },
    avatarWrapper: {
        position: 'relative',
        width: '160px',
        height: '160px',
        margin: '0 auto',
        zIndex: 3
    },
    mainAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '6px solid #FFF',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
    },
    cameraBtn: {
        position: 'absolute',
        bottom: '5px',
        right: '5px',
        backgroundColor: '#007bff',
        border: '4px solid #FFFFFF',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 16px rgba(0,123,255,0.3)',
        transition: 'transform 0.2s ease',
        padding: 0,
        outline: 'none',
    },
    urlLabel: { fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginTop: '24px', letterSpacing: '1px' },
    urlBox: { fontSize: '13px', color: '#007bff', backgroundColor: '#FFF', padding: '8px 20px', borderRadius: '100px', marginTop: '10px', border: '1px solid #E0F2FE', fontWeight: '600' },
    formPadding: { padding: '48px 40px' },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px'
    },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
    fieldLabel: { fontSize: '14px', fontWeight: '700', color: '#475569', marginLeft: '4px', display: 'flex', alignItems: 'center' },
    labelIcon: {
        color: '#94A3B8',
        marginRight: '8px',
        display: 'flex',
        marginTop: '3px',
    },
    inputLocked: {
        padding: '14px 20px', borderRadius: '16px', border: '1px solid transparent',
        backgroundColor: '#F1F5F9', color: '#94A3B8', cursor: 'not-allowed', fontSize: '15px', fontWeight: '500'
    },
    inputReadonly: {
        padding: '14px 20px', borderRadius: '16px', border: '1px solid #E2E8F0',
        backgroundColor: '#F8FAFC', color: '#1E293B', fontSize: '15px', fontWeight: '500'
    },
    inputEditing: {
        padding: '14px 20px', borderRadius: '16px', border: '2px solid #007bff',
        backgroundColor: '#FFF', outline: 'none', fontSize: '15px', fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0,123,255,0.06)'
    },
    bioGroup: { marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' },
    textarea: {
        padding: '20px', borderRadius: '20px', border: '2px solid #007bff',
        minHeight: '160px', outline: 'none', fontSize: '15px', fontWeight: '500',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",

    },
    textareaDisabled: {
        padding: '20px', borderRadius: '20px', border: '1px solid #E2E8F0',
        backgroundColor: '#F8FAFC', color: '#64748B', minHeight: '160px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",

    },
    cardFooter: { marginTop: '48px', paddingTop: '40px', borderTop: '1px solid #F1F5F9', textAlign: 'right' },
    primaryBtn: {
        backgroundColor: '#007bff', color: '#FFF', border: 'none',
        padding: '16px 36px', borderRadius: '18px', fontWeight: '750',
        cursor: 'pointer', fontSize: '16px', display: 'inline-flex', alignItems: 'center',
        boxShadow: '0 10px 20px rgba(0,123,255,0.2)'
    },
    saveBtn: {
        backgroundColor: '#10B981', color: '#FFF', border: 'none',
        padding: '16px 36px', borderRadius: '18px', fontWeight: '750',
        cursor: 'pointer', fontSize: '16px', display: 'inline-flex', alignItems: 'center',
        boxShadow: '0 10px 20px rgba(16,185,129,0.2)'
    },
    cancelBtn: {
        backgroundColor: '#F1F5F9', color: '#64748B', border: 'none',
        padding: '16px 32px', borderRadius: '18px', fontWeight: '700',
        cursor: 'pointer', fontSize: '16px', display: 'inline-flex', alignItems: 'center'
    },
    buttonGroup: { display: 'flex', gap: '16px', justifyContent: 'flex-end', flexWrap: 'wrap' },
    loadingFull: {
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: '#FFF', zIndex: 1000
    },
    spinner: { color: '#007bff' }
};

export default Profile;