

import React, { useState, useRef, useEffect } from 'react';
import {
    Search, Filter, Calendar, MapPin, Users, X, Clock,
    ChevronLeft, Menu, Bell, LayoutDashboard, UserCircle,
    Loader2, CheckCircle, AlertCircle, Send, Check, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Event {
    id: string;
    slug: string;
    title: string;
    description: string;
    categoryName: string;
    location: {
        address: string;
        city: string;
        district: string;
    };
    schedule: {
        startDate: string;
        endDate: string;
        registrationDeadline: string;
    };
    capacity: {
        maxVolunteers: number;
        currentVolunteers: number;
        minVolunteers: number;
    };
    roles: Array<{
        id: string;
        name: string;
        description: string;
        slots: number;
        filled: number;
    }>;
    media: {
        images: string[];
    };
    status: string;
}

interface InAppNotification {
    _id: string;
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
        fullName?: string;
    };
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
        fullName?: string;
        registrationId?: string;
        eventDate?: string;
        eventLocation?: string;
    };
}
interface Registration {
    id: string;
    registrationCode: string;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'confirmed' | 'checked_in' | 'checked_out' | 'rated' | 'no_show' | 'cancelled_by_volunteer' | 'cancelled_by_organizer';
    roleName: string;
    createdAt: string;
    updatedAt: string;
    approval?: {
        reviewedBy?: string;
        reviewedAt?: string;
    };
    attendance?: any;
    completion?: {
        certificateIssued: boolean;
    };
}

interface Statistics {
    totalHours: number;
    completedEvents: number;
    averageRating: number;
    rank?: string;
}


const BrowseEvents: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [categories, setCategories] = useState<string[]>([]);
    const [myRegistrations, setMyRegistrations] = useState<string[]>([]);
    const [inAppNotis, setInAppNotis] = useState<InAppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [confirmingRegistrationId, setConfirmingRegistrationId] = useState<string | null>(null);

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    
    const notificationRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    // Registration form state
    const [selectedRole, setSelectedRole] = useState('');
    const [motivation, setMotivation] = useState('');
    const [skills, setSkills] = useState('');
    const [availability, setAvailability] = useState('');
    const [experience, setExperience] = useState('');
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    const [emergencyRelation, setEmergencyRelation] = useState('');
    const [registering, setRegistering] = useState(false);

    const needConfirmation = registrations.filter(r => r.status === 'accepted');

    const [userData, setUserData] = useState<any>(null);
    const logoutPopupRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const [statistics, setStatistics] = useState<Statistics>({
            totalHours: 0,
            completedEvents: 0,
            averageRating: 0,
            rank: 'Newbie'
        });
    useEffect(() => {
        fetchUserProfile();
        fetchEvents();
        fetchMyRegistrations();
        fetchCategories();

        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(false);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (userData?.id || userData?._id) {
            fetchNotifications();
        }
    }, [userData]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showLogoutPopup && logoutPopupRef.current && !logoutPopupRef.current.contains(event.target as Node)) {
                setShowLogoutPopup(false);
            }
            if (showNotifications && notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (showFilterDropdown && filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLogoutPopup, showNotifications, showFilterDropdown]);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:8000/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                const rawData = result.data || result;
                const finalData = {
                    ...rawData,
                    avatar: rawData.avatar
                        ? (rawData.avatar.startsWith('http') ? rawData.avatar : `http://localhost:8000${rawData.avatar}`)
                        : "https://ui-avatars.com/api/?name=User"
                };
                setUserData(finalData);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/events?status=published');
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                // Filter only events that are still accepting registrations
                const now = new Date();
                const validEvents = result.data.filter((event: Event) => {
                    const deadline = new Date(event.schedule.registrationDeadline);
                    return deadline > now;
                });
                setEvents(validEvents);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8000/categories');
            const result = await response.json();
            if (result.success) {
                setCategories(result.data.map((c: any) => c.name));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchMyRegistrations = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:8000/registrations/my-registrations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                const items = result.data?.items || result.data || [];
                const registeredIds = items.map((reg: any) => reg.event?.id || reg.eventId);
                setMyRegistrations(registeredIds);
            }
        } catch (error) {
            console.error('Error fetching my registrations:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoadingNotifications(true);
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            let userId = userData?.id || userData?._id;

            if (!userId) {
                const userRes = await fetch('http://localhost:8000/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userJson = await userRes.json();
                const raw = userJson.data || userJson;
                userId = raw.id || raw._id;
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

                setInAppNotis(inAppOnly);
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
                    prev.map(n => n._id === notificationId ? { ...n, readAt: new Date().toISOString() } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleNotificationClick = async (notification: InAppNotification) => {
        if (!notification.readAt) {
            await markNotificationAsRead(notification._id);
        }

        if (notification.data?.eventId) {
            setShowNotifications(false);
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
                await markNotificationAsRead(notification._id);
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

    const canConfirmFromNotification = (notification: InAppNotification) => {
        return notification.type === 'registration_approved' && notification.data?.registrationId;
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

    const handleEventClick = (event: Event) => {
        setSelectedEvent(event);
        setShowDetailModal(true);
    };

    const handleRegisterClick = () => {
        setShowDetailModal(false);
        setShowRegisterModal(true);
    };

    const handleRegisterSubmit = async () => {
        if (!selectedEvent || !selectedRole) {
            alert('Vui lòng chọn vai trò!');
            return;
        }

        if (!motivation.trim()) {
            alert('Vui lòng nhập động lực tham gia!');
            return;
        }

        try {
            setRegistering(true);
            const token = localStorage.getItem('accessToken');

            const response = await fetch('http://localhost:8000/registrations/apply', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventId: selectedEvent.id,
                    roleId: selectedRole,
                    motivation,
                    skills: skills.split(',').map(s => s.trim()).filter(s => s),
                    availability,
                    experience,
                    emergencyContact: {
                        name: emergencyName,
                        phone: emergencyPhone,
                        relationship: emergencyRelation
                    }
                })
            });

            if (response.ok) {
                alert('✅ Đăng ký thành công! Đang chờ ban tổ chức phê duyệt.');
                setShowRegisterModal(false);
                resetRegistrationForm();
                await fetchMyRegistrations();
                await fetchEvents();
            } else {
                const error = await response.json();
                alert(`❌ Đăng ký thất bại: ${error.message || 'Vui lòng thử lại'}`);
            }
        } catch (error) {
            console.error('Error registering:', error);
            alert('❌ Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setRegistering(false);
        }
    };

    const resetRegistrationForm = () => {
        setSelectedRole('');
        setMotivation('');
        setSkills('');
        setAvailability('');
        setExperience('');
        setEmergencyName('');
        setEmergencyPhone('');
        setEmergencyRelation('');
    };

    const handleCancelRegistration = async (eventId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện này?')) return;

        try {
            const token = localStorage.getItem('accessToken');
            const regRes = await fetch('http://localhost:8000/registrations/my-registrations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const regData = await regRes.json();
            const items = regData.data?.items || regData.data || [];
            const registration = items.find((r: any) => (r.event?.id || r.eventId) === eventId);

            if (!registration) {
                alert("Không tìm thấy bản ghi đăng ký.");
                return;
            }

            const response = await fetch(`http://localhost:8000/registrations/${registration.id}/cancel`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });


            if (response.ok) {
                alert('✅ Đã hủy đăng ký thành công!');
                await fetchMyRegistrations();
                await fetchEvents();
                setShowDetailModal(false);
            } else {
                alert('❌ Hủy đăng ký thất bại.');
            }
        } catch (error) {
            console.error('Error cancelling registration:', error);
            alert('❌ Có lỗi xảy ra khi hủy đăng ký!');
        }
    };

    const fetchDashboardData = async () => {
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

            // Fetch statistics
            const statsRes = await fetch('http://localhost:8000/registrations/my-statistics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsJson = await statsRes.json();
            const s = statsJson.data || {};

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

            // Fetch registrations
            const regRes = await fetch('http://localhost:8000/registrations/my-registrations?limit=50', {
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

            setRegistrations(registrationsList);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmRegistration = async (registrationId: string) => {
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
                alert('✅ Đã xác nhận tham gia sự kiện!');
                await fetchDashboardData();
                await fetchNotifications();
            } else {
                const error = await response.json();
                alert(`❌ Lỗi: ${error.message || 'Không thể xác nhận tham gia'}`);
            }
        } catch (error) {
            console.error('Error confirming registration:', error);
            alert('❌ Có lỗi xảy ra khi xác nhận!');
        } finally {
            setConfirmingRegistrationId(null);
        }
    };


    

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location.city.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === '' || event.categoryName === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const isEventRegistered = (eventId: string) => {
        return myRegistrations.includes(eventId);
    };

    return (
        <div style={styles.layout}>
            {sidebarOpen && isMobile && <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside style={{
                ...styles.sidebar,
                ...(isMobile ? (sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed) : {})
            }}>
                <div style={styles.sidebarHeader}>
                    <h1 style={styles.brandTitle}>VolunteerHub</h1>
                    {isMobile && (
                        <button style={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
                            <ChevronLeft size={24} />
                        </button>
                    )}
                </div>

                <nav style={styles.navMenu}>
                    <SidebarLink
                        icon={<LayoutDashboard size={20} />}
                        label="Overview"
                        onClick={() => navigate('/volunteer/dashboard')} />
                    <SidebarLink
                        icon={<Search size={20} />}
                        active
                        label="Browse Events" />
                    <SidebarLink
                        icon={<Users size={20} />}
                        onClick={() => navigate('/volunteer/communication')}
                        label="Communication" />
                    <SidebarLink
                        icon={<UserCircle size={20} />}
                        onClick={() => navigate('/volunteer/profile')}
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
                                src={userData?.avatar || "https://ui-avatars.com/api/?name=User"}
                                style={styles.sidebarAvatar}
                                alt="avatar"
                            />
                            <div style={styles.userInfo}>
                                <p style={styles.userName}>{userData?.fullName || 'User'}</p>
                                <p style={styles.userEmail}>{userData?.email || ''}</p>
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
                            <h2 style={styles.headerTitle}>Browse Events</h2>
                            <p style={styles.headerSub}>Discover volunteering opportunities you love</p>
                        </div>
                    </div>
<div style={styles.headerRight}>
    {/* 1. Khu vực Nút và Popup Thông báo */}
    <div style={{ position: 'relative' }} ref={notificationRef}>
        <button
            style={styles.iconBtn}
            onClick={() => setShowNotifications(!showNotifications)}
        >
            <Bell size={20} fill={unreadCount > 0 ? "#F59E0B" : "none"} />
            {unreadCount > 0 && (
                <span style={styles.notificationBadge}>{unreadCount}</span>
            )}
        </button>

        {/* Popup Thông báo */}
        {showNotifications && (
            <div style={styles.notificationPopup}>
                {/* Header của Popup */}
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

                {/* Body của Popup: Danh sách thông báo */}
                <div style={styles.notificationList}>
                    {loadingNotifications ? (
                        <div style={styles.notificationLoading}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} color="#007bff" />
                            <span>Đang tải...</span>
                        </div>
                    ) : (inAppNotis.length === 0 && needConfirmation.length === 0) ? (
                        <div style={styles.emptyNotifications}>
                            <div style={styles.emptyIcon}>📂</div>
                            <p style={styles.emptyNotificationText}>Không có thông báo mới</p>
                        </div>
                    ) : (
                        <>
                            {/* Danh sách các mục cần XÁC NHẬN (từ needConfirmation) */}
                            {needConfirmation.map((reg) => (
                                <div key={`confirm-${reg.id}`} style={{...styles.notificationItem, backgroundColor: '#FFFBEB', borderLeft: '4px solid #F59E0B'}}>
                                    <div style={styles.notificationIconWrapper}>
                                        {/* <span style={styles.notificationEmoji}>🔔</span> */}
                                    </div>
                                    <div style={styles.notificationContent}>
                                        <h4 style={styles.notificationSubject}>Yêu cầu xác nhận tham gia</h4>
                                        <p style={styles.notificationText}>Sự kiện: <strong>{reg.eventTitle}</strong></p>
                                        <button
                                            style={styles.confirmNotificationBtn}
                                            onClick={() => handleConfirmRegistration(reg.id)}
                                            disabled={confirmingRegistrationId === reg.id}
                                        >
                                            {confirmingRegistrationId === reg.id ? <Loader2 size={14} style={{animation: 'spin 1s linear infinite', backgroundColor: '#F59E0B'}} /> : 'Xác nhận'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {/* Danh sách THÔNG BÁO HỆ THỐNG (từ inAppNotis) */}
                            {inAppNotis.map((notification) => (
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
                                            {!notification.readAt && <span style={styles.unreadDot}></span>}
                                        </h4>
                                        <p style={styles.notificationText}>{notification.content}</p>
                                        <span style={styles.notificationTime}>
                                            {formatNotificationTime(notification.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Footer của Popup */}
                <div style={styles.notificationFooter} onClick={() => navigate('/volunteer/notifications')}>
                    {/* Xem tất cả */}
                </div>
            </div>
        )}
    </div>

    {/* 2. Khu vực Profile người dùng (Ngoài chuông thông báo) */}
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
                    {/* Search & Filter Section */}
                    <div style={styles.searchSection}>
                        <div style={styles.searchBox}>
                            <Search size={20} style={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sự kiện theo tên, thể loại hoặc địa điểm..."
                                style={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div style={{ position: 'relative' }} ref={filterRef}>
                            <button
                                style={styles.filterBtn}
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            >
                                <Filter size={20} />
                                <span style={styles.filterText}>
                                    {selectedCategory || 'Tất cả thể loại'}
                                </span>
                            </button>

                            {showFilterDropdown && (
                                <div style={styles.filterDropdown}>
                                    <div
                                        className="filter-option"
                                        style={styles.filterOption}
                                        onClick={() => {
                                            setSelectedCategory('');
                                            setShowFilterDropdown(false);
                                        }}
                                    >
                                        ✨ Tất cả thể loại
                                    </div>
                                    {categories.map(cat => (
                                        <div
                                            key={cat}
                                            className="filter-option"
                                            style={styles.filterOption}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setShowFilterDropdown(false);
                                            }}
                                        >
                                            {cat}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Events Grid */}
                    {loading ? (
                        <div style={styles.loadingState}>
                            <Loader2 size={48} style={styles.spinner} />
                            <p>Đang tải sự kiện...</p>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div style={styles.emptyState}>
                            <AlertCircle size={64} color="#94A3B8" />
                            <h3 style={styles.emptyTitle}>Không tìm thấy sự kiện</h3>
                            <p style={styles.emptyText}>Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn</p>
                        </div>
                    ) : (
                        <div style={styles.eventsGrid}>
                            {filteredEvents.map(event => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onClick={() => handleEventClick(event)}
                                    isRegistered={isEventRegistered(event.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Event Detail Modal */}
            {showDetailModal && selectedEvent && (
                <div style={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button style={styles.modalClose} onClick={() => setShowDetailModal(false)}>
                            <X size={24} />
                        </button>

                        <img
                            src={selectedEvent.media.images[0] ? `http://localhost:8000${selectedEvent.media.images[0]}` : '/api/placeholder/800/400'}
                            style={styles.modalImage}
                            alt={selectedEvent.title}
                        />

                        <div style={styles.modalBody}>
                            <span style={styles.categoryBadge}>{selectedEvent.categoryName}</span>
                            <h2 style={styles.modalTitle}>{selectedEvent.title}</h2>
                            <p style={styles.modalDescription}>{selectedEvent.description}</p>

                            <div style={styles.modalInfo}>
                                <div style={styles.infoItem}>
                                    <Calendar size={18} color="#42A5F5" />
                                    <span>{formatDate(selectedEvent.schedule.startDate)}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <MapPin size={18} color="#42A5F5" />
                                    <span>{selectedEvent.location.address}, {selectedEvent.location.district}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <Users size={18} color="#42A5F5" />
                                    <span>{selectedEvent.capacity.currentVolunteers} / {selectedEvent.capacity.maxVolunteers} tình nguyện viên</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <Clock size={18} color="#EF4444" />
                                    <span>Hạn đăng ký: {formatDate(selectedEvent.schedule.registrationDeadline)}</span>
                                </div>
                            </div>

                            <div style={styles.rolesSection}>
                                <h3 style={styles.rolesTitle}>Các vai trò có sẵn</h3>
                                {selectedEvent.roles.map(role => (
                                    <div key={role.id} style={styles.roleItem}>
                                        <div>
                                            <p style={styles.roleName}>{role.name}</p>
                                            <p style={styles.roleDesc}>{role.description}</p>
                                        </div>
                                        <span style={styles.roleSlots}>{role.filled}/{role.slots}</span>
                                    </div>
                                ))}
                            </div>

                            {isEventRegistered(selectedEvent.id) ? (
                                <button
                                    style={{ ...styles.registerBtn, backgroundColor: '#EF4444', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)' }}
                                    onClick={() => handleCancelRegistration(selectedEvent.id)}
                                >
                                    <X size={20} />
                                    Hủy đăng ký
                                </button>
                            ) : (
                                <button style={styles.registerBtn} onClick={handleRegisterClick}>
                                    <Send size={20} />
                                    Đăng ký ngay
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Registration Modal */}
            {showRegisterModal && selectedEvent && (
                <div style={styles.modalOverlay} onClick={() => setShowRegisterModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button style={styles.modalClose} onClick={() => setShowRegisterModal(false)}>
                            <X size={24} />
                        </button>

                        <div style={styles.modalBody}>
                            <h2 style={styles.modalTitle}>Đăng ký tham gia: {selectedEvent.title}</h2>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Chọn vai trò *</label>
                                <select
                                    style={styles.formSelect}
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="">Chọn vai trò...</option>
                                    {selectedEvent.roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name} ({role.filled}/{role.slots})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Động lực tham gia *</label>
                                <textarea
                                    style={styles.formTextarea}
                                    placeholder="Tại sao bạn muốn tham gia sự kiện này?"
                                    value={motivation}
                                    onChange={(e) => setMotivation(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Kỹ năng (phân cách bằng dấu phẩy)</label>
                                <input
                                    style={styles.formInput}
                                    placeholder="Ví dụ: làm việc nhóm, giao tiếp, sơ cứu"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                />
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Thời gian có thể tham gia</label>
                                    <input
                                        style={styles.formInput}
                                        placeholder="Ví dụ: Cuối tuần, Toàn thời gian"
                                        value={availability}
                                        onChange={(e) => setAvailability(e.target.value)}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Kinh nghiệm</label>
                                    <input
                                        style={styles.formInput}
                                        placeholder="Kinh nghiệm tình nguyện trước đây"
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={styles.emergencySection}>
                                <h3 style={styles.sectionTitle}>Thông tin liên hệ khẩn cấp</h3>
                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Họ tên</label>
                                        <input
                                            style={styles.formInput}
                                            placeholder="Tên người liên hệ"
                                            value={emergencyName}
                                            onChange={(e) => setEmergencyName(e.target.value)}
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Số điện thoại</label>
                                        <input
                                            style={styles.formInput}
                                            placeholder="SĐT người liên hệ"
                                            value={emergencyPhone}
                                            onChange={(e) => setEmergencyPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Mối quan hệ</label>
                                    <input
                                        style={styles.formInput}
                                        placeholder="Ví dụ: Bố/Mẹ, Bạn bè"
                                        value={emergencyRelation}
                                        onChange={(e) => setEmergencyRelation(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    style={styles.cancelModalBtn}
                                    onClick={() => setShowRegisterModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    style={styles.submitBtn}
                                    onClick={handleRegisterSubmit}
                                    disabled={registering || !selectedRole || !motivation.trim()}
                                >
                                    {registering ? (
                                        <>
                                            <Loader2 size={20} style={styles.spinner} />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} />
                                            Gửi đăng ký
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                .filter-option:hover {
                    background-color: #F1F5F9 !important;
                    color: #007bff !important;
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
const EventCard: React.FC<{ event: Event; onClick: () => void; isRegistered: boolean }> = ({ event, onClick, isRegistered }) => {
    const progress = (event.capacity.currentVolunteers / event.capacity.maxVolunteers) * 100;
    const imageUrl = event.media.images[0] ? `http://localhost:8000${event.media.images[0]}` : '/api/placeholder/400/240';

    return (
        <div style={styles.eventCard} onClick={onClick}>
            <div style={{ ...styles.eventImage, backgroundImage: `url(${imageUrl})` }}>
                <span style={styles.eventCategory}>{event.categoryName}</span>
                {isRegistered && (
                    <span style={styles.registeredBadge}>
                        <CheckCircle size={16} />
                        Đã đăng ký
                    </span>
                )}
            </div>
            <div style={styles.eventBody}>
                <h3 style={styles.eventTitle}>{event.title}</h3>
                <div style={styles.eventMeta}>
                    <div style={styles.metaItem}>
                        <Calendar size={16} />
                        <span>{new Date(event.schedule.startDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div style={styles.metaItem}>
                        <MapPin size={16} />
                        <span>{event.location.district}</span>
                    </div>
                    <div style={styles.metaItem}>
                        <Users size={16} />
                        <span>{event.capacity.currentVolunteers}/{event.capacity.maxVolunteers}</span>
                    </div>
                </div>
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                </div>
                <p style={styles.progressText}>Đã đăng ký: {Math.round(progress)}%</p>
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
        fontFamily: "'Segoe UI', sans-serif",
        position: 'relative',
        width: '100vw'
    },
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
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
        zIndex: 100,
        flexShrink: 0,
        overflowY: 'auto',
        transition: 'transform 0.3s'
    },
    sidebarOpen: { position: 'fixed', left: 0, top: 0, transform: 'translateX(0)' },
    sidebarClosed: { position: 'fixed', left: 0, top: 0, transform: 'translateX(-100%)' },
    sidebarHeader: {
        padding: '32px 24px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    brandTitle: { fontSize: '24px', fontWeight: 'bold', color: '#343a40', margin: 0 },
    closeBtn: {
        background: '#F1F5F9',
        border: 'none',
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    navMenu: { flex: 1, padding: '24px 16px' },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        color: '#64748B',
        cursor: 'pointer',
        borderRadius: '14px',
        marginBottom: '4px',
        fontSize: '15px',
        fontWeight: '500'
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
    navIcon: { marginRight: '12px' },
    sidebarFooter: { padding: '20px', borderTop: '1px solid #F1F5F9', marginTop: 'auto' },
    userCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#F8FAFC',
        borderRadius: '16px',
        cursor: 'pointer'
    },
    userDropdown: {
        position: 'absolute',
        bottom: 'calc(100% + 10px)',
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        border: '1px solid #E2E8F0',
        padding: '8px',
        zIndex: 1000
    },
    dropdownHeader: {
        padding: '8px 12px',
        fontSize: '11px',
        fontWeight: '800',
        color: '#94A3B8',
        textTransform: 'uppercase'
    },
    dropdownItem: {
        padding: '10px 12px',
        fontSize: '14px',
        borderRadius: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
    },
    sidebarAvatar: {
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #FFF'
    },
    userInfo: { flex: 1, minWidth: 0 },
    userName: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#1E293B',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    userEmail: {
        fontSize: '12px',
        color: '#94A3B8',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
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
        padding: 0
    },
    headerRight: { display: 'flex', alignItems: 'center', gap: '20px' },
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
        position: 'relative'
    },
    notificationBadge: {
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        backgroundColor: '#EF4444',
        color: 'white',
        fontSize: '11px',
        fontWeight: '700',
        padding: '2px 6px',
        borderRadius: '10px',
        minWidth: '18px',
        textAlign: 'center',
        border: '2px solid white',
    },
    notificationPopup: {
        position: 'absolute',
        top: 'calc(100% + 12px)',
        right: 0,
        width: '480px',
        maxWidth: '90vw',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
        border: '1px solid #E2E8F0',
        zIndex: 1000,
        overflow: 'hidden',
    },
    notificationHeader: {
        padding: '20px 24px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    notificationTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1E293B',
        margin: 0,
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
        transition: 'all 0.2s',
    },
    notificationList: {
        maxHeight: '520px',
        overflowY: 'auto',
    },
    notificationLoading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        gap: '12px',
        color: '#64748B',
        fontSize: '14px',
    },
    emptyNotifications: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        gap: '12px',
    },
    emptyIcon: {
        fontSize: '48px',
    },
    emptyNotificationText: {
        fontSize: '15px',
        color: '#94A3B8',
        fontWeight: '600',
        margin: 0,
        textAlign: 'center',
    },
    notificationItem: {
        padding: '20px 24px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex',
        gap: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    notificationIconWrapper: {
        flexShrink: 0,
    },
    notificationEmoji: {
        fontSize: '32px',
        display: 'block',
    },
    notificationContent: {
        flex: 1,
        minWidth: 0,
    },
    notificationSubject: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#1E293B',
        margin: '0 0 6px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    unreadDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        flexShrink: 0,
    },
    notificationText: {
        fontSize: '14px',
        color: '#64748B',
        margin: '0 0 12px 0',
        lineHeight: '1.6',
    },
    notificationEventDetails: {
        backgroundColor: '#F8FAFC',
        padding: '12px',
        borderRadius: '12px',
        marginBottom: '12px',
        borderLeft: '3px solid #007bff',
    },
    notificationEventTitle: {
        fontSize: '14px',
        color: '#007bff',
        fontWeight: '700',
        margin: '0 0 6px 0',
    },
    notificationEventMeta: {
        fontSize: '13px',
        color: '#64748B',
        margin: '4px 0',
        fontWeight: '500',
    },
    notificationTime: {
        fontSize: '12px',
        color: '#94A3B8',
        fontWeight: '500',
        display: 'block',
        marginBottom: '12px',
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
        marginTop: '8px',
    },
    userProfileMini: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingLeft: '20px',
        borderLeft: '1px solid #E2E8F0'
    },
    miniEmail: { fontSize: '14px', color: '#475569', fontWeight: '600' },
    miniAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #F1F5F9'
    },
    scrollArea: { padding: '32px 24px', overflowY: 'auto' },
    searchSection: {
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap'
    },
    searchBox: {
        flex: 1,
        minWidth: '300px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        backgroundColor: '#FFF',
        border: '2px solid #E2E8F0',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    },
    searchIcon: { color: '#94A3B8' },
    searchInput: {
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        color: '#1E293B',
        backgroundColor: 'transparent'
    },
    filterBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: '#FFF',
        border: '2px solid #E2E8F0',
        borderRadius: '16px',
        cursor: 'pointer',
        fontWeight: '600',
        color: '#475569',
        fontSize: '15px'
    },
    filterText: { display: 'inline' },
    filterDropdown: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '220px',
        backgroundColor: '#FFF',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        border: '1px solid #E2E8F0',
        zIndex: 110,
        padding: '8px',
    },
    filterOption: {
        padding: '10px 16px',
        fontSize: '14px',
        color: '#475569',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    eventsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px'
    },
    loadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        color: '#64748B'
    },
    spinner: {
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        textAlign: 'center'
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
        color: '#64748B'
    },
    eventCard: {
        backgroundColor: '#FFF',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #E2E8F0',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    eventImage: {
        height: '200px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '16px'
    },
    eventCategory: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        color: '#FFF',
        padding: '6px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600'
    },
    registeredBadge: {
        backgroundColor: '#10B981',
        color: '#FFF',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    },
    eventBody: {
        padding: '20px'
    },
    eventTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: '12px',
        lineHeight: '1.4'
    },
    eventMeta: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '16px'
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#64748B'
    },
    progressBar: {
        height: '6px',
        backgroundColor: '#E2E8F0',
        borderRadius: '3px',
        overflow: 'hidden',
        marginTop: '12px'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#42A5F5',
        borderRadius: '3px',
        transition: 'width 0.3s ease'
    },
    progressText: {
        fontSize: '12px',
        color: '#94A3B8',
        marginTop: '8px',
        textAlign: 'right'
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px'
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: '24px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    },
    modalClose: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        border: 'none',
        color: '#FFF',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        transition: 'background 0.2s',
        padding: 0
    },
    modalImage: {
        width: '100%',
        height: '300px',
        objectFit: 'cover'
    },
    modalBody: {
        padding: '32px'
    },
    categoryBadge: {
        display: 'inline-block',
        backgroundColor: '#E3F2FD',
        color: '#1976D2',
        padding: '6px 16px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '700',
        marginBottom: '16px'
    },
    modalTitle: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: '16px',
        lineHeight: '1.3'
    },
    modalDescription: {
        fontSize: '16px',
        color: '#475569',
        lineHeight: '1.6',
        marginBottom: '24px'
    },
    modalInfo: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
        padding: '24px',
        backgroundColor: '#F8FAFC',
        borderRadius: '16px'
    },
    infoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        color: '#475569',
        fontWeight: '500'
    },
    rolesSection: {
        marginBottom: '32px'
    },
    rolesTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: '16px'
    },
    roleItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#F8FAFC',
        borderRadius: '12px',
        marginBottom: '12px',
        border: '1px solid #E2E8F0'
    },
    roleName: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: '4px'
    },
    roleDesc: {
        fontSize: '14px',
        color: '#64748B',
        margin: 0
    },
    roleSlots: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#42A5F5',
        backgroundColor: '#E3F2FD',
        padding: '6px 12px',
        borderRadius: '8px'
    },
    registerBtn: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '16px',
        backgroundColor: '#42A5F5',
        color: '#FFF',
        border: 'none',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(66, 165, 245, 0.3)',
        transition: 'all 0.3s ease'
    },
    formGroup: {
        marginBottom: '20px'
    },
    formLabel: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '700',
        color: '#475569',
        marginBottom: '8px'
    },
    formInput: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '15px',
        borderRadius: '12px',
        border: '2px solid #E2E8F0',
        backgroundColor: '#FFF',
        color: '#1E293B',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontFamily: "'Segoe UI', sans-serif"
    },
    formSelect: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '15px',
        borderRadius: '12px',
        border: '2px solid #E2E8F0',
        backgroundColor: '#FFF',
        color: '#1E293B',
        outline: 'none',
        cursor: 'pointer',
        fontFamily: "'Segoe UI', sans-serif"
    },
    formTextarea: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '15px',
        borderRadius: '12px',
        border: '2px solid #E2E8F0',
        backgroundColor: '#FFF',
        color: '#1E293B',
        outline: 'none',
        resize: 'vertical',
        minHeight: '100px',
        fontFamily: "'Segoe UI', sans-serif"
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
    },
    emergencySection: {
        marginTop: '32px',
        padding: '24px',
        backgroundColor: '#FEF3C7',
        borderRadius: '16px',
        border: '1px solid #FDE68A'
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#92400E',
        marginBottom: '16px'
    },
    modalActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '32px',
        flexWrap: 'wrap'
    },
    cancelModalBtn: {
        padding: '14px 28px',
        backgroundColor: '#F1F5F9',
        color: '#64748B',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer'
    },
    submitBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 28px',
        backgroundColor: '#10B981',
        color: '#FFF',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
    },
    // Thêm vào trong đối tượng styles của bạn
    noti: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#EF4444',
        color: 'white',
        fontSize: '10px',
        fontWeight: 'bold',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid white',
        // Thêm dòng này để tạo hiệu ứng gây chú ý
        animation: 'pulse 2s infinite', 
    },
};

export default BrowseEvents;