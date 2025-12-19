import React, { useState, useRef, useEffect } from 'react';
import {
    LayoutDashboard, Search, Users, UserCircle, Bell, Menu, ChevronLeft,
    Clock, Award, Star, TrendingUp, CheckCircle, AlertCircle,
    Calendar, MapPin, ArrowRight, Loader2, ThumbsUp, LogOut
} from 'lucide-react';

interface Statistics {
    totalHours: number;
    completedEvents: number;
    averageRating: number;
    rank?: string;
}

interface Registration {
    id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    isConfirmed: boolean;
    isRated: boolean;
    event: {
        id: string;
        title: string;
        startDate: string;
        endDate: string;
        location: string;
        thumbnail?: string;
    };
    createdAt: string;
}

interface Announcement {
    id: string;
    content: string;
    isPinned: boolean;
    createdAt: string;
    author: {
        fullName: string;
    };
}

const VolunteerDashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [loading, setLoading] = useState(true);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const logoutPopupRef = useRef<HTMLDivElement>(null);

    const [statistics, setStatistics] = useState<Statistics>({
        totalHours: 0,
        completedEvents: 0,
        averageRating: 0,
        rank: 'Newbie'
    });

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();

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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLogoutPopup]);

    // const fetchDashboardData = async () => {
    //     try {
    //         setLoading(true);
    //         const token = localStorage.getItem('accessToken');

    //         // Fetch user profile
    //         const userRes = await fetch('http://localhost:8000/users/me', {
    //             headers: { 'Authorization': `Bearer ${token}` }
    //         });
    //         const userData = await userRes.json();
    //         userData.data.avatar = `http://localhost:8000/uploads/avatars/${userData.data.avatar}`
    //         setUserData(userData.data || userData);

    //         alert(userData?.avatar);

    //         // Fetch statistics
    //         const statsRes = await fetch('http://localhost:8000/registrations/my-statistics', {
    //             headers: { 'Authorization': `Bearer ${token}` }
    //         });
    //         const statsData = await statsRes.json();

    //         // Calculate rank based on hours
    //         let rank = 'Newbie';
    //         const hours = statsData.data?.totalHours || 0;
    //         if (hours >= 100) rank = 'Legend';
    //         else if (hours >= 50) rank = 'Expert';
    //         else if (hours >= 20) rank = 'Intermediate';

    //         setStatistics({
    //             totalHours: statsData.data?.totalHours || 0,
    //             completedEvents: statsData.data?.completedEvents || 0,
    //             averageRating: statsData.data?.averageRating || 0,
    //             rank
    //         });

    //         // Fetch registrations
    //         const regRes = await fetch('http://localhost:8000/registrations/my-registrations?limit=10', {
    //             headers: { 'Authorization': `Bearer ${token}` }
    //         });
    //         const regData = await regRes.json();
    //         setRegistrations(regData.data?.items || []);

    //         // Fetch announcements (mock for now as endpoint may vary)
    //         // You would typically loop through events and fetch their pinned posts
    //         setAnnouncements([]);

    //     } catch (error) {
    //         console.error('Error fetching dashboard data:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            // 1. Fetch user profile
            const userRes = await fetch('http://localhost:8000/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userJson = await userRes.json();
            const rawData = userJson.data || userJson; // Đảm bảo lấy đúng object chứa thông tin user

            // Xử lý logic ảnh avatar để không bị undefined
            const finalData = {
                ...rawData,
                avatar: rawData.avatar
                    ? (rawData.avatar.startsWith('http') ? rawData.avatar : `http://localhost:8000${rawData.avatar}`)
                    : "https://ui-avatars.com/api/?name=User"
            };

            setUserData(finalData);

            // 2. Fetch statistics
            const statsRes = await fetch('http://localhost:8000/registrations/my-statistics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsJson = await statsRes.json();
            const s = statsJson.data || {}; // Tránh undefined nếu API lỗi

            let rank = 'Newbie';
            const hours = s.totalHours || 0;
            if (hours >= 100) rank = 'Legend';
            else if (hours >= 50) rank = 'Expert';
            else if (hours >= 20) rank = 'Intermediate';

            setStatistics({
                totalHours: s.totalHours || 0,
                completedEvents: s.completedEvents || 0,
                averageRating: s.averageRating || 0,
                rank
            });

            // 3. Fetch registrations
            const regRes = await fetch('http://localhost:8000/registrations/my-registrations?limit=10', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const regJson = await regRes.json();
            // Kiểm tra đúng cấu trúc phân trang của bạn (data.items)
            setRegistrations(regJson.data?.items || regJson.data || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmRegistration = async (registrationId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8000/registrations/${registrationId}/confirm`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Đã xác nhận tham gia sự kiện!');
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error confirming registration:', error);
            alert('Có lỗi xảy ra khi xác nhận!');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
    };

    const closeSidebar = () => setSidebarOpen(false);

    // Calculate action items
    const needConfirmation = registrations.filter(r => r.status === 'accepted' && !r.isConfirmed);
    const needRating = registrations.filter(r => r.status === 'completed' && !r.isRated);
    const pendingRegistrations = registrations.filter(r => r.status === 'pending');
    const upcomingEvents = registrations.filter(r =>
        r.status === 'accepted' && r.isConfirmed && new Date(r.event.startDate) > new Date()
    ).slice(0, 3);

    if (loading) {
        return (
            <div style={styles.loadingFull}>
                <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={48} color="#007bff" />
            </div>
        );
    }

    return (
        <div style={styles.layout}>
            {/* Overlay */}
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
                        <h1 style={styles.brandTitle}>VolunteerHub</h1>
                    </div>
                    {isMobile && (
                        <button style={styles.closeBtn} onClick={closeSidebar}>
                            <ChevronLeft size={24} />
                        </button>
                    )}
                </div>

                <nav style={styles.navMenu}>
                    <SidebarLink icon={<LayoutDashboard size={20} />} label="Overview" active />
                    <SidebarLink icon={<Search size={20} />} label="Browse Events" />
                    <SidebarLink icon={<Users size={20} />} label="Attendee Insights" />
                    <SidebarLink icon={<UserCircle size={20} />} label="My Profile" />
                </nav>

                <div style={styles.sidebarFooter}>
                    <div style={{ position: 'relative' }} ref={logoutPopupRef}>
                        {showLogoutPopup && (
                            <div style={styles.userDropdown}>
                                <div style={styles.dropdownHeader}>Account</div>
                                <div style={styles.dropdownItem} onClick={handleLogout}>
                                    <LogOut size={16} style={{ marginRight: 8 }} />
                                    <span style={{ color: '#EF4444', fontWeight: '600' }}>Logout</span>
                                </div>
                            </div>
                        )}
                        <div style={styles.userCard} onClick={() => setShowLogoutPopup(!showLogoutPopup)}>
                            <img
                                src={userData?.avatar || `http://localhost:8000/uploads/avatars/default.png`}
                                style={styles.sidebarAvatar}
                                alt="avatar"
                            />
                            <div style={styles.userInfo}>
                                <p style={styles.userName}>{userData?.fullName || 'User Name'}</p>
                                <p style={styles.userEmail}>{userData?.email}</p>
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
                            <h2 style={styles.headerTitle}>Dashboard</h2>
                            <p style={styles.headerSub}>Welcome back, {userData?.fullName?.split(' ')[0] || 'Volunteer'}!</p>
                        </div>
                    </div>
                    <div style={styles.headerRight}>
                        <button style={styles.iconBtn}>
                            <Bell size={20} />
                        </button>
                        {!isMobile && (
                            <div style={styles.userProfileMini}>
                                <span style={styles.miniEmail}>{userData?.email}</span>
                                <img
                                    src={userData?.avatar || "https://ui-avatars.com/api/?name=User"}
                                    style={styles.miniAvatar}
                                    alt="avatar"
                                />
                            </div>
                        )}
                    </div>
                </header>

                <div style={styles.scrollArea}>
                    {/* Action Alerts */}
                    {(needConfirmation.length > 0 || needRating.length > 0) && (
                        <div style={styles.alertsSection}>
                            {needConfirmation.length > 0 && (
                                <div style={styles.alertCard}>
                                    <div style={styles.alertIcon}>
                                        <CheckCircle size={24} color="#F59E0B" />
                                    </div>
                                    <div style={styles.alertContent}>
                                        <h4 style={styles.alertTitle}>Xác nhận tham gia</h4>
                                        <p style={styles.alertText}>
                                            Bạn có {needConfirmation.length} sự kiện mới được duyệt, hãy xác nhận tham gia ngay!
                                        </p>
                                    </div>
                                    <button
                                        style={styles.alertBtn}
                                        onClick={() => handleConfirmRegistration(needConfirmation[0].id)}
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            )}

                            {needRating.length > 0 && (
                                <div style={{ ...styles.alertCard, borderColor: '#10B981' }}>
                                    <div style={styles.alertIcon}>
                                        <Star size={24} color="#10B981" />
                                    </div>
                                    <div style={styles.alertContent}>
                                        <h4 style={styles.alertTitle}>Đánh giá sự kiện</h4>
                                        <p style={styles.alertText}>
                                            Bạn vừa hoàn thành {needRating.length} sự kiện, hãy để lại đánh giá nhé!
                                        </p>
                                    </div>
                                    <button style={{ ...styles.alertBtn, backgroundColor: '#10B981' }}>
                                        Đánh giá
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div style={styles.statsGrid}>
                        <StatCard
                            icon={<Clock size={28} />}
                            title="Tổng giờ tình nguyện"
                            value={`${statistics.totalHours}h`}
                            color="#007bff"
                            bgColor="#F0F7FF"
                        />
                        <StatCard
                            icon={<Award size={28} />}
                            title="Sự kiện hoàn thành"
                            value={statistics.completedEvents.toString()}
                            color="#10B981"
                            bgColor="#ECFDF5"
                        />
                        <StatCard
                            icon={<Star size={28} />}
                            title="Đánh giá trung bình"
                            value={statistics.averageRating.toFixed(1)}
                            color="#F59E0B"
                            bgColor="#FFF7ED"
                        />
                        <StatCard
                            icon={<TrendingUp size={28} />}
                            title="Cấp độ hiện tại"
                            value={statistics.rank || 'Newbie'}
                            color="#8B5CF6"
                            bgColor="#F5F3FF"
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div style={styles.contentGrid}>
                        {/* Left Column - Registrations */}
                        <div style={styles.leftColumn}>
                            <div style={styles.sectionCard}>
                                <div style={styles.sectionHeader}>
                                    <h3 style={styles.sectionTitle}>Đăng ký gần đây</h3>
                                    <button style={styles.viewAllBtn}>
                                        Xem tất cả <ArrowRight size={16} />
                                    </button>
                                </div>

                                {pendingRegistrations.length === 0 && upcomingEvents.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <AlertCircle size={48} color="#CBD5E1" />
                                        <p style={styles.emptyText}>Chưa có đăng ký nào</p>
                                    </div>
                                ) : (
                                    <div style={styles.registrationList}>
                                        {pendingRegistrations.map(reg => (
                                            <RegistrationCard key={reg.id} registration={reg} type="pending" />
                                        ))}
                                        {upcomingEvents.map(reg => (
                                            <RegistrationCard key={reg.id} registration={reg} type="upcoming" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Schedule & Announcements */}
                        <div style={styles.rightColumn}>
                            {/* Upcoming Schedule */}
                            <div style={styles.sectionCard}>
                                <div style={styles.sectionHeader}>
                                    <h3 style={styles.sectionTitle}>Lịch trình sắp tới</h3>
                                </div>

                                {upcomingEvents.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <Calendar size={48} color="#CBD5E1" />
                                        <p style={styles.emptyText}>Không có lịch trình</p>
                                    </div>
                                ) : (
                                    <div style={styles.scheduleList}>
                                        {upcomingEvents.map(reg => (
                                            <ScheduleItem key={reg.id} registration={reg} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Announcements */}
                            <div style={styles.sectionCard}>
                                <div style={styles.sectionHeader}>
                                    <h3 style={styles.sectionTitle}>Thông báo mới</h3>
                                </div>

                                <div style={styles.emptyState}>
                                    <Bell size={48} color="#CBD5E1" />
                                    <p style={styles.emptyText}>Chưa có thông báo mới</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 30px -10px rgba(0,0,0,0.1);
                }
                
                .registration-card:hover {
                    background-color: #F8FAFC;
                }
                
                .alert-btn:hover {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

// Sub Components
const SidebarLink = ({ icon, label, active = false }: any) => (
    <div style={active ? styles.navItemActive : styles.navItem}>
        <span style={styles.navIcon}>{icon}</span>
        <span style={styles.navLabel}>{label}</span>
    </div>
);

const StatCard = ({ icon, title, value, color, bgColor }: any) => (
    <div className="stat-card" style={{ ...styles.statCard, borderColor: color }}>
        <div style={{ ...styles.statIcon, backgroundColor: bgColor, color }}>
            {icon}
        </div>
        <div style={styles.statContent}>
            <p style={styles.statTitle}>{title}</p>
            <h3 style={{ ...styles.statValue, color }}>{value}</h3>
        </div>
    </div>
);

const RegistrationCard = ({ registration, type }: any) => {
    const statusConfig = {
        pending: { label: 'Đang chờ duyệt', color: '#F59E0B', bg: '#FFF7ED' },
        upcoming: { label: 'Sắp diễn ra', color: '#10B981', bg: '#ECFDF5' }
    };

    const config = statusConfig[type as keyof typeof statusConfig];

    return (
        <div className="registration-card" style={styles.registrationCard}>
            <div style={styles.regCardHeader}>
                <h4 style={styles.regCardTitle}>{registration.event.title}</h4>
                <span style={{ ...styles.statusBadge, backgroundColor: config.bg, color: config.color }}>
                    {config.label}
                </span>
            </div>
            <div style={styles.regCardMeta}>
                <div style={styles.metaItem}>
                    <Calendar size={14} color="#94A3B8" />
                    <span>{new Date(registration.event.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div style={styles.metaItem}>
                    <MapPin size={14} color="#94A3B8" />
                    <span>{registration.event.location}</span>
                </div>
            </div>
        </div>
    );
};

const ScheduleItem = ({ registration }: any) => (
    <div style={styles.scheduleItem}>
        <div style={styles.scheduleDate}>
            <div style={styles.scheduleDay}>
                {new Date(registration.event.startDate).getDate()}
            </div>
            <div style={styles.scheduleMonth}>
                Tháng {new Date(registration.event.startDate).getMonth() + 1}
            </div>
        </div>
        <div style={styles.scheduleContent}>
            <h4 style={styles.scheduleTitle}>{registration.event.title}</h4>
            <p style={styles.scheduleTime}>
                {new Date(registration.event.startDate).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </p>
        </div>
    </div>
);

// Styles
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
        margin: 0,
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
    navLabel: { flex: 1 },
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
        bottom: 'calc(100% + 10px)',
        left: '0',
        right: '0',
        backgroundColor: '#FFF',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
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
    scrollArea: {
        padding: 'clamp(24px, 4vw, 40px)',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
    },

    // Alert Section
    alertsSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '32px'
    },
    alertCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '20px 24px',
        backgroundColor: '#FFF',
        borderRadius: '20px',
        border: '2px solid #F59E0B',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
    },
    alertIcon: {
        flexShrink: 0
    },
    alertContent: {
        flex: 1,
        minWidth: 0
    },
    alertTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1E293B',
        margin: '0 0 4px 0'
    },
    alertText: {
        fontSize: '14px',
        color: '#64748B',
        margin: 0
    },
    alertBtn: {
        backgroundColor: '#F59E0B',
        color: '#FFF',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'transform 0.2s ease',
        flexShrink: 0
    },

    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
    },
    statCard: {
        backgroundColor: '#FFF',
        borderRadius: '24px',
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        border: '2px solid',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
    },
    statIcon: {
        width: '64px',
        height: '64px',
        borderRadius: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    statContent: {
        flex: 1,
        minWidth: 0
    },
    statTitle: {
        fontSize: '13px',
        color: '#64748B',
        margin: '0 0 8px 0',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    statValue: {
        fontSize: '32px',
        fontWeight: '800',
        margin: 0,
        letterSpacing: '-0.5px'
    },

    // Content Grid
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px'
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    rightColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    sectionCard: {
        backgroundColor: '#FFF',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px'
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#0F172A',
        margin: 0
    },
    viewAllBtn: {
        backgroundColor: 'transparent',
        color: '#007bff',
        border: 'none',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '12px',
        transition: 'background 0.2s ease'
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: '16px'
    },
    emptyText: {
        fontSize: '15px',
        color: '#94A3B8',
        fontWeight: '600',
        margin: 0
    },

    // Registration List
    registrationList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    registrationCard: {
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
    },
    regCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '12px'
    },
    regCardTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1E293B',
        margin: 0,
        flex: 1
    },
    statusBadge: {
        fontSize: '12px',
        fontWeight: '700',
        padding: '6px 14px',
        borderRadius: '100px',
        flexShrink: 0
    },
    regCardMeta: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: '#64748B',
        fontWeight: '500'
    },

    // Schedule
    scheduleList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    scheduleItem: {
        display: 'flex',
        gap: '16px',
        padding: '16px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
    },
    scheduleDate: {
        width: '60px',
        height: '60px',
        borderRadius: '14px',
        backgroundColor: '#F0F7FF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: '2px solid #007bff'
    },
    scheduleDay: {
        fontSize: '22px',
        fontWeight: '800',
        color: '#007bff',
        lineHeight: 1
    },
    scheduleMonth: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#64748B',
        marginTop: '2px',
        textTransform: 'uppercase'
    },
    scheduleContent: {
        flex: 1,
        minWidth: 0
    },
    scheduleTitle: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#1E293B',
        margin: '0 0 6px 0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    scheduleTime: {
        fontSize: '13px',
        color: '#64748B',
        fontWeight: '600',
        margin: 0
    },

    loadingFull: {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        zIndex: 1000
    },

    // Media queries handled via inline conditions
    // '@media (min-width: 1024px)': {
    //     contentGrid: {
    //         gridTemplateColumns: '2fr 1fr'
    //     }
    // }
};

export default VolunteerDashboard;
