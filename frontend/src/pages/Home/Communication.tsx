import React, { useState, useRef, useEffect } from 'react';
import {
    LayoutDashboard, Search, Users, UserCircle, Bell, Menu, ChevronLeft,
    MessageSquare, Calendar, MapPin, ArrowRight, Loader2, LogOut, X,
    AlertCircle, Clock, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Registration {
    id: string;
    registrationCode: string;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    status: string;
    roleName: string;
    createdAt: string;
    updatedAt: string;
}

interface InAppNotification {
    id: string;
    type: string;
    subject: string;
    content: string;
    readAt: string | null;
    createdAt: string;
    data: {
        eventTitle?: string;
        eventId?: string;
        registrationId?: string;
        eventDate?: string;
        eventLocation?: string;
    };
}

const MyEventsCommunication: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [loading, setLoading] = useState(true);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmingRegistrationId, setConfirmingRegistrationId] = useState<string | null>(null);

    const logoutPopupRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const [confirmedEvents, setConfirmedEvents] = useState<Registration[]>([]);
    const [inAppNotis, setInAppNotis] = useState<InAppNotification[]>([]);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        fetchConfirmedEvents();
        fetchNotifications();

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
            if (showNotifications && notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLogoutPopup, showNotifications]);

    const fetchConfirmedEvents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            // Fetch user data
            const userRes = await fetch('http://localhost:8000/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userJson = await userRes.json();
            const rawData = userJson.data || userJson;

            const finalData = {
                ...rawData,
                avatar: rawData.avatar
                    ? (rawData.avatar.startsWith('http') ? rawData.avatar : `http://localhost:8000${rawData.avatar}`)
                    : "https://ui-avatars.com/api/?name=User"
            };

            setUserData(finalData);

            // Fetch registrations
            const regRes = await fetch('http://localhost:8000/registrations/my-registrations?limit=100', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const regJson = await regRes.json();

            // Handle both response formats
            let registrationsList = [];
            if (regJson.data?.items) {
                registrationsList = regJson.data.items;
            } else if (Array.isArray(regJson.data)) {
                registrationsList = regJson.data;
            } else if (Array.isArray(regJson)) {
                registrationsList = regJson;
            }

            // Filter only confirmed events
            const confirmed = registrationsList.filter((r: Registration) =>
                r.status === 'confirmed' ||
                r.status === 'checked_in' ||
                r.status === 'checked_out' ||
                r.status === 'completed'
            );

            setConfirmedEvents(confirmed);

        } catch (error) {
            console.error('Error fetching confirmed events:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoadingNotifications(true);
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            let userId = userData?.id;

            if (!userId) {
                const userRes = await fetch('http://localhost:8000/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userJson = await userRes.json();
                const raw = userJson.data || userJson;
                userId = raw.id;
            }

            const response = await fetch(`http://localhost:8000/notifications/${userId}?channel=in_app`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();

                let allNotis = [];
                if (Array.isArray(result)) {
                    allNotis = result;
                } else if (result.data && Array.isArray(result.data)) {
                    allNotis = result.data;
                } else if (result.data && result.data.items && Array.isArray(result.data.items)) {
                    allNotis = result.data.items;
                } else if (result.data && result.data.notifications && Array.isArray(result.data.notifications)) {
                    allNotis = result.data.notifications;
                }

                const inAppOnly = allNotis
                    .filter((n: any) => !n.channel || n.channel === 'in_app')
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                const latest5 = inAppOnly.slice(0, 5);
                setInAppNotis(latest5);

                const unread = inAppOnly.filter((n: any) => !n.readAt).length;
                setUnreadCount(unread);
            } else {
                setInAppNotis([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setInAppNotis([]);
            setUnreadCount(0);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const markNotificationAsRead = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8000/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setInAppNotis(prev =>
                    prev.map(n => n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleNotificationClick = async (notification: InAppNotification) => {
        if (!notification.readAt) {
            await markNotificationAsRead(notification.id);
        }

        if (notification.data?.eventId) {
            navigate(`/event/communication/${notification.data.eventId}`);
        }
    };

    const handleConfirmAttendanceFromNotification = async (e: React.MouseEvent, notification: InAppNotification) => {
        e.stopPropagation();

        const registrationId = notification.data?.registrationId;
        if (!registrationId) {
            alert('Không tìm thấy thông tin đăng ký!');
            return;
        }

        try {
            setConfirmingRegistrationId(registrationId);
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`http://localhost:8000/registrations/${registrationId}/confirm`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('✅ Đã xác nhận tham gia sự kiện thành công!');
                await markNotificationAsRead(notification.id);
                await fetchConfirmedEvents();
                await fetchNotifications();
            } else {
                const error = await response.json();
                alert(`❌ Lỗi: ${error.message || 'Không thể xác nhận tham gia'}`);
            }
        } catch (error) {
            console.error('Error confirming attendance:', error);
            alert('❌ Có lỗi xảy ra khi xác nhận tham gia!');
        } finally {
            setConfirmingRegistrationId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
    };

    const closeSidebar = () => setSidebarOpen(false);

    const handleEventClick = (eventId: string) => {
        navigate(`/event/communication/${eventId}`);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'registration_approved':
                return '✅';
            case 'registration_rejected':
                return '❌';
            case 'event_reminder':
                return '🔔';
            case 'event_cancelled':
                return '⚠️';
            default:
                return '📢';
        }
    };

    const formatNotificationTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const canConfirmFromNotification = (notification: InAppNotification) => {
        return notification.type === 'registration_approved' && notification.data?.registrationId;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: { [key: string]: { label: string; color: string; bg: string } } = {
            confirmed: { label: 'Đã xác nhận', color: '#10B981', bg: '#ECFDF5' },
            checked_in: { label: 'Đã check-in', color: '#3B82F6', bg: '#EFF6FF' },
            checked_out: { label: 'Đã check-out', color: '#8B5CF6', bg: '#F5F3FF' },
            completed: { label: 'Hoàn thành', color: '#F59E0B', bg: '#FFF7ED' }
        };

        return statusConfig[status] || { label: status, color: '#64748B', bg: '#F1F5F9' };
    };

    // Filter events based on search
    const filteredEvents = confirmedEvents.filter(event =>
        event.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.eventLocation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div style={styles.loadingFull}>
                <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={48} color="#007bff" />
            </div>
        );
    }

    return (
        <div style={styles.layout}>
            {sidebarOpen && isMobile && (
                <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
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
                    <SidebarLink
                        icon={<LayoutDashboard size={20} />}
                        label="Overview" 
                        onClick={() => navigate('/volunteer/dashboard')}/>
                    <SidebarLink
                        icon={<Search size={20} />}
                        onClick={() => navigate('/volunteer/events')}
                        label="Browse Events" />
                    <SidebarLink
                        icon={<Users size={20} />}
                        label="Communication" active />
                    <SidebarLink
                        icon={<UserCircle size={20} />}
                        onClick={() => navigate('/me/profile')}
                        label="My Profile" />
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
                            <h2 style={styles.headerTitle}>Diễn Đàn Sự Kiện</h2>
                            <p style={styles.headerSub}>Tham gia thảo luận với các sự kiện bạn đã xác nhận</p>
                        </div>
                    </div>
                    <div style={styles.headerRight}>
                        {/* Notification Bell */}
                        <div style={{ position: 'relative' }} ref={notificationRef}>
                            <button
                                style={styles.iconBtn}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span style={styles.notificationBadge}>{unreadCount}</span>
                                )}
                            </button>

                            {showNotifications && (
                                <div style={styles.notificationPopup}>
                                    <div style={styles.notificationHeader}>
                                        <h3 style={styles.notificationTitle}>
                                            🔔 Thông báo {unreadCount > 0 && `(${unreadCount})`}
                                        </h3>
                                        <button
                                            style={styles.closeNotificationBtn}
                                            onClick={() => setShowNotifications(false)}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div style={styles.notificationList}>
                                        {loadingNotifications ? (
                                            <div style={styles.notificationLoading}>
                                                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                                                <span>Đang tải...</span>
                                            </div>
                                        ) : inAppNotis.length === 0 ? (
                                            <div style={styles.emptyNotifications}>
                                                <div style={styles.emptyIcon}>📂</div>
                                                <p style={styles.emptyNotificationText}>Không có thông báo mới</p>
                                            </div>
                                        ) : (
                                            inAppNotis.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    style={{
                                                        ...styles.notificationItem,
                                                        backgroundColor: notification.readAt ? '#FFFFFF' : '#F0F7FF'
                                                    }}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div style={styles.notificationIconWrapper}>
                                                        <span style={styles.notificationEmoji}>
                                                            {getNotificationIcon(notification.type)}
                                                        </span>
                                                    </div>
                                                    <div style={styles.notificationContent}>
                                                        <h4 style={styles.notificationSubject}>
                                                            {notification.subject}
                                                            {!notification.readAt && (
                                                                <span style={styles.unreadDot}></span>
                                                            )}
                                                        </h4>
                                                        <p style={styles.notificationText}>
                                                            {notification.content}
                                                        </p>

                                                        {notification.data?.eventTitle && (
                                                            <div style={styles.notificationEventDetails}>
                                                                <p style={styles.notificationEventTitle}>
                                                                    📌 {notification.data.eventTitle}
                                                                </p>
                                                                {notification.data?.eventDate && (
                                                                    <p style={styles.notificationEventMeta}>
                                                                        📅 {new Date(notification.data.eventDate).toLocaleDateString('vi-VN', {
                                                                            weekday: 'long',
                                                                            year: 'numeric',
                                                                            month: 'long',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </p>
                                                                )}
                                                                {notification.data?.eventLocation && (
                                                                    <p style={styles.notificationEventMeta}>
                                                                        📍 {notification.data.eventLocation}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        <span style={styles.notificationTime}>
                                                            {formatNotificationTime(notification.createdAt)}
                                                        </span>

                                                        {canConfirmFromNotification(notification) && (
                                                            <button
                                                                style={styles.confirmNotificationBtn}
                                                                onClick={(e) => handleConfirmAttendanceFromNotification(e, notification)}
                                                                disabled={confirmingRegistrationId === notification.data.registrationId}
                                                            >
                                                                {confirmingRegistrationId === notification.data.registrationId ? (
                                                                    <>
                                                                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                                        Đang xác nhận...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Check size={16} />
                                                                        Xác nhận tham gia
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isMobile && userData && (
                            <div style={styles.userProfileMini}>
                                <span style={styles.miniEmail}>{userData.email}</span>
                                <img src={userData.avatar} style={styles.miniAvatar} alt="avatar" />
                            </div>
                        )}
                    </div>
                </header>

                <div style={styles.scrollArea}>
                    {/* Search Section */}
                    <div style={styles.searchSection}>
                        <div style={styles.searchBox}>
                            <Search size={20} style={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sự kiện theo tên hoặc địa điểm..."
                                style={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Events Stats */}
                    <div style={styles.statsCard}>
                        <div style={styles.statItem}>
                            <div style={styles.statIconWrapper}>
                                <MessageSquare size={24} color="#007bff" />
                            </div>
                            <div>
                                <p style={styles.statLabel}>Tổng sự kiện</p>
                                <h3 style={styles.statValue}>{confirmedEvents.length}</h3>
                            </div>
                        </div>
                        <div style={styles.statDivider}></div>
                        <div style={styles.statItem}>
                            <div style={styles.statIconWrapper}>
                                <Clock size={24} color="#10B981" />
                            </div>
                            <div>
                                <p style={styles.statLabel}>Sắp diễn ra</p>
                                <h3 style={styles.statValue}>
                                    {confirmedEvents.filter(e => new Date(e.eventDate) > new Date()).length}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Events Grid */}
                    {filteredEvents.length === 0 ? (
                        <div style={styles.emptyState}>
                            <AlertCircle size={64} color="#94A3B8" />
                            <h3 style={styles.emptyTitle}>Không tìm thấy sự kiện</h3>
                            <p style={styles.emptyText}>
                                {searchQuery
                                    ? 'Thử điều chỉnh tìm kiếm của bạn'
                                    : 'Bạn chưa xác nhận tham gia sự kiện nào'}
                            </p>
                            {!searchQuery && (
                                <button
                                    style={styles.browseBtn}
                                    onClick={() => navigate('/volunteer/events')}
                                >
                                    Duyệt sự kiện mới
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={styles.eventsGrid}>
                            {filteredEvents.map(event => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onClick={() => handleEventClick(event.eventId)}
                                    statusBadge={getStatusBadge(event.status)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                * {
                    box-sizing: border-box;
                }

                .event-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
                }

                @media (max-width: 1024px) {
                    .eventsGrid {
                        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
                    }
                }

                @media (max-width: 768px) {
                    .searchSection {
                        padding: 0 !important;
                    }
                    
                    .statsCard {
                        flex-direction: column !important;
                        gap: 16px !important;
                    }
                    
                    .statDivider {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

const SidebarLink = ({ icon, label, active = false, onClick }: any) => (
    <div style={active ? styles.navItemActive : styles.navItem} onClick={onClick}>
        <span style={styles.navIcon}>{icon}</span>
        <span style={styles.navLabel}>{label}</span>
    </div>
);

// Event Card Component
const EventCard = ({ event, onClick, statusBadge }: any) => {
    const eventDate = new Date(event.eventDate);
    const isUpcoming = eventDate > new Date();

    return (
        <div className="event-card" style={styles.eventCard} onClick={onClick}>
            <div style={styles.eventCardHeader}>
                <div style={{
                    ...styles.eventDateBadge,
                    backgroundColor: isUpcoming ? '#F0F7FF' : '#F8FAFC',
                    borderColor: isUpcoming ? '#007bff' : '#E2E8F0'
                }}>
                    <div style={{
                        ...styles.eventDay,
                        color: isUpcoming ? '#007bff' : '#64748B'
                    }}>
                        {eventDate.getDate()}
                    </div>
                    <div style={styles.eventMonth}>
                        Th{eventDate.getMonth() + 1}
                    </div>
                </div>
                <span style={{
                    ...styles.statusBadge,
                    backgroundColor: statusBadge.bg,
                    color: statusBadge.color
                }}>
                    {statusBadge.label}
                </span>
            </div>

            <div style={styles.eventCardBody}>
                <h3 style={styles.eventTitle}>{event.eventTitle}</h3>

                <div style={styles.eventMeta}>
                    <div style={styles.metaItem}>
                        <Calendar size={16} color="#64748B" />
                        <span>{eventDate.toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                        })}</span>
                    </div>
                    <div style={styles.metaItem}>
                        <MapPin size={16} color="#64748B" />
                        <span>{event.eventLocation}</span>
                    </div>
                </div>

                <div style={styles.eventCardFooter}>
                    <span style={styles.roleTag}>{event.roleName}</span>
                    <button style={styles.joinForumBtn}>
                        <MessageSquare size={16} />
                        Tham gia thảo luận
                    </button>
                </div>
            </div>
        </div>
    );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
    layout: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: 'relative',
        width: '100vw'
    },
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        zIndex: 90,
        backdropFilter: 'blur(4px)'
    },
    sidebar: {
        width: '280px',
        backgroundColor: '#FFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        overflowY: 'auto',
        transition: 'transform 0.3s ease'
    },
    sidebarOpen: {
        position: 'fixed',
        left: 0,
        top: 0,
        transform: 'translateX(0)'
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
    navIcon: {
        marginRight: '12px'
    },
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
        transition: 'all 0.2s'
    },
    userDropdown: {
        position: 'absolute',
        bottom: 'calc(100% + 10px)',
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderRadius: '16px',
        boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
        border: '1px solid #E2E8F0',
        padding: '8px',
        zIndex: 1000
    },
    dropdownHeader: {
        padding: '8px 12px',
        fontSize: '11px',
        fontWeight: '800',
        color: '#94A3B8',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px'
    },
    dropdownItem: {
        padding: '12px 14px',
        fontSize: '14px',
        borderRadius: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s',
        fontWeight: '600'
    },
    sidebarAvatar: {
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        objectFit: 'cover' as const,
        border: '2px solid #E2E8F0'
    },
    userInfo: {
        flex: 1,
        minWidth: 0
    },
    userName: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#1E293B',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const
    },
    userEmail: {
        fontSize: '12px',
        color: '#94A3B8',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
    },
    topHeader: {
        height: '80px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 80,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    headerTitle: {
        fontSize: '24px',
        fontWeight: '800',
        color: '#0F172A',
        margin: 0
    },
    headerSub: {
        fontSize: '14px',
        color: '#64748B',
        margin: '4px 0 0 0',
        fontWeight: '500'
    },
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
        padding: 0,
        color: '#64748B',
        transition: 'all 0.2s'
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    iconBtn: {
        background: '#FFF',
        border: '1px solid #E2E8F0',
        cursor: 'pointer',
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        position: 'relative',
        transition: 'all 0.2s',
        color: '#64748B'
    },
    notificationBadge: {
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        backgroundColor: '#EF4444',
        color: 'white',
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 6px',
        borderRadius: '10px',
        minWidth: '20px',
        textAlign: 'center' as const,
        border: '2px solid white',
        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
    },
    notificationPopup: {
        position: 'absolute',
        top: 'calc(100% + 12px)',
        right: 0,
        width: '480px',
        maxWidth: '90vw',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
        border: '1px solid #E2E8F0',
        zIndex: 1000,
        overflow: 'hidden'
    },
    notificationHeader: {
        padding: '20px 24px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC'
    },
    notificationTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1E293B',
        margin: 0
    },
    closeNotificationBtn: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#64748B',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        transition: 'all 0.2s'
    },
    notificationList: {
        maxHeight: '520px',
        overflowY: 'auto' as const
    },
    notificationLoading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        gap: '12px',
        color: '#64748B',
        fontSize: '14px'
    },
    emptyNotifications: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        gap: '12px'
    },
    emptyIcon: {
        fontSize: '48px'
    },
    emptyNotificationText: {
        fontSize: '15px',
        color: '#94A3B8',
        fontWeight: '600',
        margin: 0,
        textAlign: 'center' as const
    },
    notificationItem: {
        padding: '20px 24px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex',
        gap: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    notificationIconWrapper: {
        flexShrink: 0
    },
    notificationEmoji: {
        fontSize: '32px',
        display: 'block'
    },
    notificationContent: {
        flex: 1,
        minWidth: 0
    },
    notificationSubject: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#1E293B',
        margin: '0 0 6px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    unreadDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        flexShrink: 0
    },
    notificationText: {
        fontSize: '14px',
        color: '#64748B',
        margin: '0 0 12px 0',
        lineHeight: '1.6'
    },
    notificationEventDetails: {
        backgroundColor: '#F8FAFC',
        padding: '12px',
        borderRadius: '12px',
        marginBottom: '12px',
        borderLeft: '3px solid #007bff'
    },
    notificationEventTitle: {
        fontSize: '14px',
        color: '#007bff',
        fontWeight: '700',
        margin: '0 0 6px 0'
    },
    notificationEventMeta: {
        fontSize: '13px',
        color: '#64748B',
        margin: '4px 0',
        fontWeight: '500'
    },
    notificationTime: {
        fontSize: '12px',
        color: '#94A3B8',
        fontWeight: '500',
        display: 'block',
        marginBottom: '12px'
    },
    confirmNotificationBtn: {
        backgroundColor: '#10B981',
        color: 'white',
        border: 'none',
        padding: '10px 18px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        marginTop: '8px'
    },
    userProfileMini: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingLeft: '20px',
        borderLeft: '1px solid #E2E8F0'
    },
    miniEmail: {
        fontSize: '14px',
        color: '#475569',
        fontWeight: '600'
    },
    miniAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover' as const,
        border: '2px solid #F1F5F9'
    },
    scrollArea: {
        padding: '32px',
        overflowY: 'auto' as const,
        flex: 1
    },
    searchSection: {
        marginBottom: '32px'
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        backgroundColor: '#FFF',
        border: '2px solid #E2E8F0',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        transition: 'all 0.2s'
    },
    searchIcon: {
        color: '#94A3B8',
        flexShrink: 0
    },
    searchInput: {
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        color: '#1E293B',
        backgroundColor: 'transparent',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    statsCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        padding: '28px 32px',
        backgroundColor: '#FFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        marginBottom: '32px'
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: 1
    },
    statIconWrapper: {
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    statLabel: {
        fontSize: '13px',
        color: '#64748B',
        margin: '0 0 6px 0',
        fontWeight: '600',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px'
    },
    statValue: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#1E293B',
        margin: 0
    },
    statDivider: {
        width: '1px',
        height: '48px',
        backgroundColor: '#E2E8F0'
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        textAlign: 'center' as const,
        backgroundColor: '#FFF',
        borderRadius: '24px',
        border: '1px solid #E2E8F0'
    },
    emptyTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1E293B',
        marginTop: '24px',
        marginBottom: '8px'
    },
    emptyText: {
        fontSize: '16px',
        color: '#64748B',
        marginBottom: '24px'
    },
    browseBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 28px',
        backgroundColor: '#007bff',
        color: '#FFF',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
        transition: 'all 0.2s'
    },
    eventsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px'
    },
    eventCard: {
        backgroundColor: '#FFF',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    eventCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid #F1F5F9'
    },
    eventDateBadge: {
        width: '60px',
        height: '60px',
        borderRadius: '14px',
        border: '2px solid',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    eventDay: {
        fontSize: '22px',
        fontWeight: '800',
        lineHeight: 1
    },
    eventMonth: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#64748B',
        marginTop: '2px',
        textTransform: 'uppercase' as const
    },
    statusBadge: {
        fontSize: '12px',
        fontWeight: '700',
        padding: '6px 14px',
        borderRadius: '100px',
        flexShrink: 0
    },
    eventCardBody: {
        padding: '24px'
    },
    eventTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1E293B',
        margin: '0 0 16px 0',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    eventMeta: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px'
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#64748B',
        fontWeight: '500'
    },
    eventCardFooter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        paddingTop: '20px',
        borderTop: '1px solid #F1F5F9'
    },
    roleTag: {
        fontSize: '12px',
        fontWeight: '700',
        color: '#8B5CF6',
        backgroundColor: '#F5F3FF',
        padding: '6px 12px',
        borderRadius: '8px'
    },
    joinForumBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#007bff',
        color: '#FFF',
        border: 'none',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0
    },
    loadingFull: {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        zIndex: 1000
    }
};

export default MyEventsCommunication;