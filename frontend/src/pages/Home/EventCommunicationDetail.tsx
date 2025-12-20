import React, { useState, useRef, useEffect } from 'react';
import {
    LayoutDashboard, Search, Users, UserCircle, Bell, Menu, ChevronLeft,
    MessageSquare, Heart, Send, Trash2, Edit2, Pin, MoreVertical,
    Image as ImageIcon, X, Loader2, LogOut, ArrowRight,
    PinOff, Check, AlertCircle, Calendar, MapPin
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

interface Post {
    id: string;
    eventId: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    images?: string[];
    isPinned: boolean;
    likesCount: number;
    commentsCount: number;
    likedBy: string[];
    comments: Comment[];
    createdAt: string;
}

interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
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
    };
}

interface EventData {
    id: string;
    title: string;
    description: string;
    schedule?: {
        startDate: string;
        endDate: string;
        registrationDeadline: string;
    };
    location?: {
        address: string;
        city: string;
        district: string;
    };
    media?: {
        images: string[];
        videos: string[];
        documents: string[];
    };
    coverImage?: string;
}

interface UserData {
    _id?: string;
    id?: string;
    fullName: string;
    email: string;
    avatar: string;
    role: string;
}

const EventCommunicationDetail: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    const USER_API_URL = 'http://localhost:8000';

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showPostMenu, setShowPostMenu] = useState<string | null>(null);

    const [userData, setUserData] = useState<UserData | null>(null);
    const [eventData, setEventData] = useState<EventData | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [inAppNotis, setInAppNotis] = useState<InAppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [submittingPost, setSubmittingPost] = useState(false);
    const [eventNotFound, setEventNotFound] = useState(false);

    const [sortBy, setSortBy] = useState<'latest' | 'most_active'>('latest');
    const [postContent, setPostContent] = useState('');
    const [postImages, setPostImages] = useState<File[]>([]);
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
    const [editingPost, setEditingPost] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const logoutPopupRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const postMenuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ==================== EFFECTS ====================
    useEffect(() => {
        if (!eventId) {
            alert('❌ Không tìm thấy ID sự kiện!');
            navigate('/volunteer/dashboard');
            return;
        }

        fetchUserProfile();
        fetchEventData();
        fetchPosts();
        fetchNotifications();

        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(false);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [eventId]);

    useEffect(() => {
        if (eventId) {
            fetchPosts();
        }
    }, [sortBy, eventId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showLogoutPopup && logoutPopupRef.current && !logoutPopupRef.current.contains(event.target as Node)) {
                setShowLogoutPopup(false);
            }
            if (showNotifications && notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (showPostMenu && postMenuRef.current && !postMenuRef.current.contains(event.target as Node)) {
                setShowPostMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLogoutPopup, showNotifications, showPostMenu]);

    // ==================== API FUNCTIONS ====================
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${USER_API_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                const rawData = result.data || result;
                const finalData = {
                    ...rawData,
                    avatar: rawData.avatar
                        ? (rawData.avatar.startsWith('http') ? rawData.avatar : `${USER_API_URL}${rawData.avatar}`)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(rawData.fullName || 'User')}`
                };
                setUserData(finalData);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchEventData = async () => {
        try {
            if (!eventId) return;

            const response = await fetch(`${USER_API_URL}/events/${eventId}`);

            if (response.ok) {
                const result = await response.json();
                const event = result.data || result;

                console.log('Event data received:', event);

                let coverImageUrl = '';
                if (event.media?.images && Array.isArray(event.media.images) && event.media.images.length > 0) {
                    const firstImage = event.media.images[0];
                    if (firstImage.startsWith('http')) {
                        coverImageUrl = firstImage;
                    } else {
                        coverImageUrl = `${USER_API_URL}${firstImage}`;
                    }
                }

                console.log('Processed cover image URL:', coverImageUrl);

                const processedEvent: EventData = {
                    id: event.id || event._id,
                    title: event.title,
                    description: event.description,
                    schedule: event.schedule,
                    location: event.location,
                    media: event.media,
                    coverImage: coverImageUrl
                };

                setEventData(processedEvent);
                setEventNotFound(false);
            } else if (response.status === 404) {
                setEventNotFound(true);
                alert('❌ Không tìm thấy sự kiện!');
                setTimeout(() => navigate('/volunteer/dashboard'), 2000);
            }
        } catch (error) {
            console.error('Error fetching event data:', error);
            setEventNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            if (!eventId) return;
            setLoading(true);

            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts?sortBy=${sortBy}&limit=500`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                const rawData = result.data || result;

                const postsArray = Array.isArray(rawData.posts) ? rawData.posts : [];
                const pinnedArray = Array.isArray(rawData.pinnedPosts) ? rawData.pinnedPosts : [];

                const allPosts = [...pinnedArray, ...postsArray].map((p: any) => {
                    // Xử lý avatar tác giả
                    const processedAvatar = p.authorAvatar
                        ? (p.authorAvatar.startsWith('http') ? p.authorAvatar : `${USER_API_URL}${p.authorAvatar}`)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.authorName)}`;

                    // Xử lý mảng ảnh bài viết
                    const processedImages = p.images?.map((img: string) =>
                        img.startsWith('http') ? img : `${USER_API_URL}${img}`
                    ) || [];

                    return {
                        ...p,
                        id: p.id || p._id,
                        authorAvatar: processedAvatar,
                        images: processedImages,
                        likedBy: p.likedBy || [],
                        comments: p.comments || []
                    };
                });

                if (sortBy === 'latest') {
                    allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                }

                setPosts(allPosts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    }; const fetchNotifications = async () => {
        try {
            setLoadingNotifications(true);
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            let userId = userData?._id || userData?.id;

            if (!userId) {
                const userRes = await fetch(`${USER_API_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userRes.ok) {
                    const userJson = await userRes.json();
                    const raw = userJson.data || userJson;
                    userId = raw.id || raw.id;
                }
            }

            if (!userId) {
                setInAppNotis([]);
                setUnreadCount(0);
                return;
            }

            const response = await fetch(`${USER_API_URL}/notifications/${userId}?channel=in_app`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const result = await response.json();
                let allNotis = Array.isArray(result) ? result : (result.data || []);

                const inAppOnly = allNotis
                    .filter((n: any) => !n.channel || n.channel === 'in_app')
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                setInAppNotis(inAppOnly.slice(0, 5));
                setUnreadCount(inAppOnly.filter((n: any) => !n.readAt).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const removeImage = (index: number) => {
        setPostImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (postImages.length + files.length > 4) {
            alert('⚠️ Chỉ được thêm tối đa 4 ảnh!');
            return;
        }

        const newFiles = Array.from(files).filter(file => {
            if (!file.type.startsWith('image/')) {
                alert(`⚠️ ${file.name} không phải là ảnh!`);
                return false;
            }
            return true;
        });

        setPostImages(prev => [...prev, ...newFiles]);
        e.target.value = '';
    };

    // Hàm tạo Post (Gửi FormData)
    const handleCreatePost = async () => {
        if (!postContent.trim()) {
            alert('⚠️ Vui lòng nhập nội dung bài viết!');
            return;
        }

        try {
            setSubmittingPost(true);
            const token = localStorage.getItem('accessToken');

            const formData = new FormData();
            formData.append('content', postContent);
            // eventId lấy từ useParams() đã có ở trên
            if (eventId) formData.append('eventId', eventId);

            // Đưa các tệp tin thực tế vào FormData
            postImages.forEach((file) => {
                formData.append('images', file);
            });

            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // KHÔNG ĐƯỢC để Content-Type: application/json
                },
                body: formData
            });

            if (response.ok) {
                setPostContent('');
                setPostImages([]);
                setShowCreatePost(false);
                await fetchPosts();
                alert('✅ Đã tạo bài viết thành công!');
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`❌ Lỗi: ${errorData.message || 'Không thể tạo bài viết'}`);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('❌ Có lỗi xảy ra khi tạo bài viết!');
        } finally {
            setSubmittingPost(false);
        }
    };

    const handleLikePost = async (postId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('Vui lòng đăng nhập để thực hiện tính năng này!');
                return;
            }

            // 1. Xác định bài viết đang thao tác
            const post = posts.find(p => p.id === postId);
            if (!post) return;

            // 2. Kiểm tra xem user hiện tại đã like bài này chưa
            // Lưu ý: Kiểm tra cả userData.id và userData._id để tránh lỗi logic
            const currentUserId = userData?.id || userData?._id || '';
            const isLiked = post.likedBy.includes(currentUserId);

            // 3. Quyết định phương thức và URL
            // Nếu đã like -> gọi DELETE để unlike
            // Nếu chưa like -> gọi POST để like
            const method = isLiked ? 'DELETE' : 'POST';
            const url = `${USER_API_URL}/events/${eventId}/posts/${postId}/like`;

            console.log(`${isLiked ? '👎 Unliking' : '👍 Liking'} post...`);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // 4. Cập nhật giao diện ngay lập tức (Local Update)
                // Điều này giúp người dùng thấy kết quả ngay mà không đợi load lại trang
                setPosts(prevPosts => prevPosts.map(p => {
                    if (p.id === postId) {
                        return {
                            ...p,
                            likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
                            likedBy: isLiked
                                ? p.likedBy.filter(id => id !== currentUserId)
                                : [...p.likedBy, currentUserId]
                        };
                    }
                    return p;
                }));
            } else {
                const error = await response.json();
                console.error('❌ Lỗi thao tác Like/Unlike:', error.message);
            }
        } catch (error) {
            console.error('❌ Lỗi kết nối API:', error);
        }
    };

    const handleUpdatePost = async (postId: string) => {
        if (!editContent.trim()) {
            alert('⚠️ Nội dung không được để trống!');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const userId = userData?.id || userData?.id || '';

            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                },
                body: JSON.stringify({
                    content: editContent,
                    images: []
                })
            });

            if (response.ok) {
                setEditingPost(null);
                setEditContent('');
                await fetchPosts();
                alert('✅ Đã cập nhật bài viết!');
            } else {
                alert('❌ Không thể cập nhật bài viết!');
            }
        } catch (error) {
            console.error('Error updating post:', error);
            alert('❌ Có lỗi xảy ra!');
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm('⚠️ Bạn có chắc muốn xóa bài viết này?')) return;

        try {
            const token = localStorage.getItem('accessToken');
            const userId = userData?.id || userData?.id || '';

            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-user-id': userId,
                    'x-user-role': userData?.role || 'volunteer'
                }
            });

            if (response.ok || response.status === 204) {
                await fetchPosts();
                alert('✅ Đã xóa bài viết!');
            } else {
                alert('❌ Không thể xóa bài viết!');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('❌ Có lỗi xảy ra!');
        }
    };

    const handlePinPost = async (postId: string, isPinned: boolean) => {
        try {
            const token = localStorage.getItem('accessToken');
            const action = isPinned ? 'unpin' : 'pin';

            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}/${action}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-user-role': userData?.role || 'volunteer'
                }
            });

            if (response.ok) {
                await fetchPosts();
                alert(isPinned ? '✅ Đã bỏ ghim!' : '📌 Đã ghim bài viết!');
            } else {
                alert('❌ Không thể thực hiện thao tác!');
            }
        } catch (error) {
            console.error('Error pinning post:', error);
            alert('❌ Có lỗi xảy ra!');
        }
    };

    // ==================== COMMENT HANDLERS ====================
    const handleAddComment = async (postId: string) => {
        const content = commentInputs[postId]?.trim();
        if (!content) return;

        try {
            const token = localStorage.getItem('accessToken');
            const userId = userData?.id || userData?._id || '';
            const userName = userData?.fullName || 'User';

            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-user-id': userId,
                    'x-user-name': userName
                },
                body: JSON.stringify({
                    authorId: userId,
                    authorName: userName,
                    content
                })
            });

            if (response.ok) {
                setCommentInputs({ ...commentInputs, [postId]: '' });
                await fetchPosts();
            } else {
                alert('❌ Không thể thêm bình luận!');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('❌ Có lỗi xảy ra!');
        }
    };

    const toggleComments = (postId: string) => {
        const newExpanded = new Set(expandedComments);
        if (newExpanded.has(postId)) {
            newExpanded.delete(postId);
        } else {
            newExpanded.add(postId);
        }
        setExpandedComments(newExpanded);
    };

    // ==================== UTILITY FUNCTIONS ====================
    const formatTime = (dateString: string) => {
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

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'registration_approved': return '✅';
            case 'registration_rejected': return '❌';
            case 'event_reminder': return '🔔';
            case 'new_post': return '📝';
            case 'new_comment': return '💬';
            default: return '📢';
        }
    };

    const getFullUrl = (path: string | undefined) => {
        if (!path) return "";
        if (path.startsWith('http')) return path;

        const cleanPath = path.startsWith('/') ? path.substring(1) : path;

        return `${USER_API_URL}/${cleanPath}`;
    };

    const closeSidebar = () => setSidebarOpen(false);

    const getLocationString = (location: any): string => {
        if (!location) return '';
        if (typeof location === 'string') return location;

        const parts = [];
        if (location.address) parts.push(location.address);
        if (location.district) parts.push(location.district);
        if (location.city) parts.push(location.city);

        return parts.join(', ');
    };

    // ==================== RENDER ====================
    if (eventNotFound) {
        return (
            <div style={styles.errorContainer}>
                <AlertCircle size={64} color="#EF4444" />
                <h2 style={styles.errorTitle}>Không tìm thấy sự kiện</h2>
                <p style={styles.errorText}>Sự kiện này không tồn tại hoặc đã bị xóa.</p>
                <button style={styles.backBtn} onClick={() => navigate('/volunteer/dashboard')}>
                    <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
                    Quay lại Dashboard
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.loadingFull}>
                <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={48} color="#007bff" />
                <p style={{ marginTop: '16px', color: '#64748B' }}>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div style={styles.layout}>
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
                    <SidebarLink
                        icon={<Search size={20} />}
                        onClick={() => navigate('/volunteer/events')}
                        label="Browse Events" />
                    <SidebarLink icon={<Users size={20} />} label="Communication" />
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
                            <p style={styles.headerSub}>{eventData?.title || 'Đang tải...'}</p>
                        </div>
                    </div>
                    <div style={styles.headerRight}>
                        <div style={{ position: 'relative' }} ref={notificationRef}>
                            <button
                                style={styles.iconBtn}
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications) fetchNotifications();
                                }}
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
                                            🔔 Thông báo ({unreadCount > 0 ? `${unreadCount} mới` : 'Đã đọc hết'})
                                        </h3>
                                        <button style={styles.closeNotificationBtn} onClick={() => setShowNotifications(false)}>
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
                                                <p>Không có thông báo mới</p>
                                            </div>
                                        ) : (
                                            inAppNotis.map((notification) => (
                                                <div
                                                    key={notification._id}
                                                    style={{
                                                        ...styles.notificationItem,
                                                        backgroundColor: notification.readAt ? '#FFFFFF' : '#F0F7FF'
                                                    }}
                                                >
                                                    <span style={styles.notificationEmoji}>
                                                        {getNotificationIcon(notification.type)}
                                                    </span>
                                                    <div style={styles.notificationContent}>
                                                        <h4 style={styles.notificationSubject}>{notification.subject}</h4>
                                                        <p style={styles.notificationText}>{notification.content}</p>
                                                        <span style={styles.notificationTime}>
                                                            {formatTime(notification.createdAt)}
                                                        </span>
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
                    {/* EVENT BANNER WITH IMAGE */}
                    {eventData && (
                        <div style={{
                            ...styles.eventBanner,
                            backgroundImage: eventData.coverImage
                                ? `linear-gradient(135deg, rgba(129, 129, 129, 0.7) 0%, rgba(118, 117, 117, 0.5) 100%), url(${eventData.coverImage})`
                                : 'linear-gradient(135deg, #b5b5b6ff 30%, #434343ff 50%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}>
                            <div style={styles.eventBannerContent}>
                                <div>
                                    <h3 style={styles.eventBannerTitle}>{eventData.title}</h3>
                                    <p style={styles.eventBannerDesc}>{eventData.description}</p>
                                    {eventData.schedule && (
                                        <div style={styles.eventMeta}>
                                            <span style={styles.metaItem}>
                                                <Calendar size={16} />
                                                {new Date(eventData.schedule.startDate).toLocaleDateString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            {eventData.location && (
                                                <span style={styles.metaItem}>
                                                    <MapPin size={16} />
                                                    {getLocationString(eventData.location)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    style={styles.viewEventBtn}
                                    onClick={() => navigate(`/forum/events/${eventId}`)}
                                >
                                    Xem chi tiết <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CREATE POST CARD */}
                    <div style={styles.createPostCard}>
                        <div style={styles.createPostHeader}>
                            <img
                                src={userData?.avatar || "https://ui-avatars.com/api/?name=User"}
                                style={styles.createPostAvatar}
                                alt="avatar"
                            />
                            <button
                                style={styles.createPostInput}
                                onClick={() => setShowCreatePost(true)}
                            >
                                Bạn đang nghĩ gì về sự kiện này?
                            </button>
                        </div>
                    </div>

                    {/* CREATE POST MODAL */}
                    {showCreatePost && (
                        <div style={styles.modalOverlay} onClick={() => setShowCreatePost(false)}>
                            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <div style={styles.modalHeader}>
                                    <h3 style={styles.modalTitle}>✍️ Tạo bài viết mới</h3>
                                    <button style={styles.modalClose} onClick={() => setShowCreatePost(false)}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <div style={styles.modalBody}>
                                    <textarea
                                        style={styles.postTextarea}
                                        placeholder="Chia sẻ suy nghĩ của bạn về sự kiện... ✨"
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                        rows={6}
                                        autoFocus
                                    />

                                    {/* HIỂN THỊ ẢNH PREVIEW KHI ĐANG CHỌN */}
                                    {postImages.length > 0 && (
                                        <div style={styles.imagePreviewContainer}>
                                            {postImages.map((file, idx) => (
                                                <div key={idx} style={styles.imagePreviewItem}>
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        style={styles.imagePreview}
                                                        alt="preview"
                                                    />
                                                    <button style={styles.removeImageBtn} onClick={() => removeImage(idx)}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={handleImageSelect}
                                    />
                                    <button
                                        style={{
                                            ...styles.addImageBtn,
                                            opacity: postImages.length >= 4 ? 0.5 : 1
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={postImages.length >= 4}
                                    >
                                        <ImageIcon size={18} />
                                        <span>Thêm ảnh ({postImages.length}/4)</span>
                                    </button>
                                </div>

                                <div style={styles.modalFooter}>
                                    <button style={styles.cancelBtn} onClick={() => {
                                        setShowCreatePost(false);
                                        setPostContent('');
                                        setPostImages([]);
                                    }}>
                                        Hủy
                                    </button>
                                    <button
                                        style={{
                                            ...styles.submitBtn,
                                            opacity: (!postContent.trim() || submittingPost) ? 0.5 : 1
                                        }}
                                        onClick={handleCreatePost}
                                        disabled={!postContent.trim() || submittingPost}
                                    >
                                        {submittingPost ? (
                                            <>
                                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                                Đang đăng...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Đăng bài
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SORT SECTION */}
                    <div style={styles.sortSection}>
                        <button
                            style={sortBy === 'latest' ? styles.sortBtnActive : styles.sortBtn}
                            onClick={() => setSortBy('latest')}
                        >
                            🕐 Mới nhất
                        </button>
                        <button
                            style={sortBy === 'most_active' ? styles.sortBtnActive : styles.sortBtn}
                            onClick={() => setSortBy('most_active')}
                        >
                            🔥 Thảo luận nhiều
                        </button>
                    </div>

                    {/* POSTS LIST */}
                    {loading ? (
                        <div style={styles.loadingState}>
                            <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} color="#007bff" />
                            <p style={{ marginTop: '16px', color: '#64748B' }}>Đang tải bài viết...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div style={styles.emptyState}>
                            <AlertCircle size={64} color="#94A3B8" />
                            <h3 style={styles.emptyTitle}>Chưa có bài viết nào</h3>
                            <p style={styles.emptyText}>Hãy là người đầu tiên chia sẻ! 🎉</p>
                            <button
                                style={{ ...styles.submitBtn, marginTop: '20px' }}
                                onClick={() => setShowCreatePost(true)}
                            >
                                Tạo bài viết
                            </button>
                        </div>
                    ) : (
                        <div style={styles.postsContainer}>
                            {posts.map(post => (
                                <div key={post.id} style={styles.postCard}>
                                    <div style={styles.postHeader}>
                                        <div style={styles.postAuthor}>
                                            <img
                                                src={post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}`}
                                                style={styles.postAvatar}
                                                alt={post.authorName}
                                            />
                                            <div>
                                                <div style={styles.postAuthorName}>
                                                    {decodeURIComponent(post.authorName)}
                                                    {post.isPinned && (
                                                        <span style={styles.pinnedBadge}>
                                                            <Pin size={14} /> Ghim
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={styles.postTime}>{formatTime(post.createdAt)}</div>
                                            </div>
                                        </div>

                                        <div style={{ position: 'relative' }} ref={postMenuRef}>
                                            <button
                                                style={styles.postMenuBtn}
                                                onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            {showPostMenu === post.id && (
                                                <div style={styles.postMenu}>
                                                    {(userData?.id === post.authorId || userData?._id === post.authorId ||
                                                        userData?.role === 'event_manager') && (
                                                            <>
                                                                <div
                                                                    style={styles.postMenuItem}
                                                                    onClick={() => {
                                                                        setEditingPost(post.id);
                                                                        setEditContent(post.content);
                                                                        setShowPostMenu(null);
                                                                    }}
                                                                >
                                                                    <Edit2 size={16} /> Chỉnh sửa
                                                                </div>
                                                                <div
                                                                    style={{ ...styles.postMenuItem, color: '#EF4444' }}
                                                                    onClick={() => {
                                                                        handleDeletePost(post.id);
                                                                        setShowPostMenu(null);
                                                                    }}
                                                                >
                                                                    <Trash2 size={16} />
                                                                    <span>Xóa</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    {userData?.role === 'event_manager' && (
                                                        <div
                                                            style={styles.postMenuItem}
                                                            onClick={() => {
                                                                handlePinPost(post.id, post.isPinned);
                                                                setShowPostMenu(null);
                                                            }}
                                                        >
                                                            {post.isPinned ? (
                                                                <>
                                                                    <PinOff size={16} /> Bỏ ghim
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Pin size={16} /> Ghim bài viết
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {editingPost === post.id ? (
                                        <div style={styles.editPostSection}>
                                            <textarea
                                                style={styles.editTextarea}
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                rows={4}
                                                autoFocus
                                            />
                                            <div style={styles.editActions}>
                                                <button
                                                    style={styles.cancelEditBtn}
                                                    onClick={() => {
                                                        setEditingPost(null);
                                                        setEditContent('');
                                                    }}
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    style={styles.saveEditBtn}
                                                    onClick={() => handleUpdatePost(post.id)}
                                                >
                                                    <Check size={16} />
                                                    Lưu thay đổi
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={styles.postContent}>
                                            <p style={styles.postText}>{post.content}</p>

                                            {/* KHỐI ẢNH ĐÃ TỐI ƯU */}
                                            {(post.images ?? []).length > 0 && (
                                                <div
                                                    style={{
                                                        ...styles.postImagesGrid,
                                                        gridTemplateColumns: post.images?.length === 1 ? '1fr' : '1fr 1fr'
                                                    }}
                                                >
                                                    {post.images?.map((imgUrl, idx) => (
                                                        <div
                                                            key={`${post.id}-img-${idx}`}
                                                            style={{
                                                                ...styles.postImageContainer,
                                                                gridColumn: (post.images?.length === 3 && idx === 2) ? 'span 2' : 'auto',
                                                                aspectRatio: post.images?.length === 1 ? '16 / 9' : '1 / 1'
                                                            }}
                                                            onClick={() => window.open(imgUrl, '_blank')}
                                                        >
                                                            <img
                                                                src={imgUrl}
                                                                style={styles.postImage}
                                                                alt=""
                                                                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                                                                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div style={styles.postActions}>
                                        <button
                                            style={{
                                                ...styles.actionBtn,
                                                // Đổi màu chữ sang đỏ nếu bài viết đã được user này Like
                                                color: post.likedBy.includes(userData?.id || userData?._id || '') ? '#EF4444' : '#64748B'
                                            }}
                                            onClick={() => handleLikePost(post.id)}
                                        >
                                            <Heart
                                                size={20}
                                                // Tô màu đỏ vào bên trong trái tim nếu đã Like
                                                fill={post.likedBy.includes(userData?.id || userData?._id || '') ? '#EF4444' : 'none'}
                                            />
                                            <span style={{ fontWeight: post.likedBy.includes(userData?.id || userData?._id || '') ? '700' : '500' }}>
                                                {post.likesCount} Thích
                                            </span>
                                        </button>

                                        <button
                                            style={styles.actionBtn}
                                            onClick={() => toggleComments(post.id)}
                                        >
                                            <MessageSquare size={20} />
                                            <span>{post.commentsCount} Bình luận</span>
                                        </button>
                                    </div>

                                    {expandedComments.has(post.id) && (
                                        <div style={styles.commentsSection}>
                                            <div style={styles.commentInputSection}>
                                                <img
                                                    src={userData?.avatar || "https://ui-avatars.com/api/?name=User"}
                                                    style={styles.commentAvatar}
                                                    alt="avatar"
                                                />
                                                <div style={styles.commentInputWrapper}>
                                                    <input
                                                        style={styles.commentInput}
                                                        placeholder="Viết bình luận..."
                                                        value={commentInputs[post.id] || ''}
                                                        onChange={(e) => setCommentInputs({
                                                            ...commentInputs,
                                                            [post.id]: e.target.value
                                                        })}
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                handleAddComment(post.id);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        style={{
                                                            ...styles.sendCommentBtn,
                                                            opacity: commentInputs[post.id]?.trim() ? 1 : 0.5
                                                        }}
                                                        onClick={() => handleAddComment(post.id)}
                                                        disabled={!commentInputs[post.id]?.trim()}
                                                    >
                                                        <Send size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            {post.comments && post.comments.length > 0 && (
                                                <div style={styles.commentsList}>
                                                    {post.comments.map(comment => (
                                                        <div key={comment.id} style={styles.commentItem}>
                                                            <img
                                                                src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName)}`}
                                                                style={styles.commentAvatar}
                                                                alt={comment.authorName}
                                                            />
                                                            <div style={styles.commentBody}>
                                                                <div style={styles.commentBubble}>
                                                                    <p style={styles.commentAuthor}>{comment.authorName}</p>
                                                                    <p style={styles.commentText}>{comment.content}</p>
                                                                </div>
                                                                <div style={styles.commentMeta}>
                                                                    <span style={styles.commentTime}>{formatTime(comment.createdAt)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
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

                button:hover:not(:disabled) {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }

                button:active:not(:disabled) {
                    transform: translateY(0);
                }

                button:disabled {
                    cursor: not-allowed;
                }

                textarea:focus,
                input:focus {
                    outline: none;
                    border-color: #007bff !important;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
                }

                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                ::-webkit-scrollbar-track {
                    background: #F1F5F9;
                }

                ::-webkit-scrollbar-thumb {
                    background: #CBD5E1;
                    border-radius: 4px;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: #94A3B8;
                }

                @media (max-width: 1024px) {
                    .scrollArea {
                        padding: 16px !important;
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
        transition: 'all 0.2s',
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
        width: '420px',
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
        maxHeight: '480px',
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
    notificationItem: {
        padding: '18px 24px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex',
        gap: '14px',
        transition: 'all 0.2s',
        cursor: 'pointer'
    },
    notificationEmoji: {
        fontSize: '28px',
        display: 'block',
        flexShrink: 0
    },
    notificationContent: {
        flex: 1,
        minWidth: 0
    },
    notificationSubject: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#1E293B',
        margin: '0 0 6px 0'
    },
    notificationText: {
        fontSize: '14px',
        color: '#64748B',
        margin: '0 0 8px 0',
        lineHeight: '1.5'
    },
    notificationTime: {
        fontSize: '12px',
        color: '#94A3B8',
        fontWeight: '500'
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
    eventBanner: {
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 10px 30px rgba(0, 123, 255, 0.2)',
        position: 'relative' as const,
        minHeight: '200px'
    },
    eventBannerContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap' as const
    },
    eventBannerTitle: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#FFF',
        margin: '0 0 8px 0',
        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    eventBannerDesc: {
        fontSize: '16px',
        color: 'rgba(255, 255, 255, 0.95)',
        margin: '0 0 12px 0',
        lineHeight: '1.6',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
    },
    eventMeta: {
        display: 'flex',
        gap: '20px',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.95)',
        fontWeight: '600',
        flexWrap: 'wrap' as const
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
    },
    viewEventBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        color: '#FFF',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap' as const
    },
    createPostCard: {
        backgroundColor: '#FFF',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #E2E8F0'
    },
    createPostHeader: {
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
    },
    createPostAvatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        objectFit: 'cover' as const,
        border: '2px solid #E2E8F0',
        flexShrink: 0
    },
    createPostInput: {
        flex: 1,
        padding: '14px 20px',
        backgroundColor: '#F8FAFC',
        border: '2px solid #E2E8F0',
        borderRadius: '24px',
        fontSize: '15px',
        color: '#94A3B8',
        cursor: 'pointer',
        textAlign: 'left' as const,
        transition: 'all 0.2s',
        fontWeight: '500'
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
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto' as const,
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
    },
    modalHeader: {
        padding: '28px 32px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFF',
        zIndex: 10
    },
    modalTitle: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#1E293B',
        margin: 0
    },
    modalClose: {
        background: '#F1F5F9',
        border: 'none',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748B',
        transition: 'all 0.2s',
        padding: 0
    },
    modalBody: {
        padding: '24px 32px'
    },
    postTextarea: {
        width: '100%',
        padding: '16px',
        fontSize: '15px',
        borderRadius: '16px',
        border: '2px solid #E2E8F0',
        backgroundColor: '#F8FAFC',
        color: '#1E293B',
        outline: 'none',
        resize: 'vertical' as const,
        minHeight: '140px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        lineHeight: '1.6',
        transition: 'all 0.2s'
    },
    imagePreviewContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px',
        marginTop: '16px'
    },
    imagePreviewItem: {
        position: 'relative',
        paddingTop: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#F1F5F9'
    },
    imagePreview: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const
    },
    removeImageBtn: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: '#FFF',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        padding: 0
    },
    addImageBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        marginTop: '16px',
        backgroundColor: '#F8FAFC',
        border: '2px dashed #CBD5E1',
        borderRadius: '12px',
        color: '#64748B',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        width: '100%',
        justifyContent: 'center'
    },
    modalFooter: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        padding: '24px 32px',
        borderTop: '1px solid #F1F5F9',
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#FFF'
    },
    cancelBtn: {
        padding: '12px 24px',
        backgroundColor: '#F1F5F9',
        color: '#64748B',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    submitBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 28px',
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
    sortSection: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap' as const
    },
    sortBtn: {
        padding: '10px 20px',
        backgroundColor: '#FFF',
        color: '#64748B',
        border: '2px solid #E2E8F0',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    sortBtnActive: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#FFF',
        border: '2px solid #007bff',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 123, 255, 0.25)'
    },
    loadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        gap: '16px',
        color: '#64748B'
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        textAlign: 'center' as const
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
    postsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    postCard: {
        backgroundColor: '#FFF',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #E2E8F0',
        transition: 'all 0.2s'
    },
    postHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
    },
    postAuthor: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
    },
    postAvatar: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        objectFit: 'cover' as const,
        border: '2px solid #E2E8F0',
        flexShrink: 0
    },
    postAuthorName: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1E293B',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    pinnedBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        backgroundColor: '#FEF3C7',
        color: '#92400E',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700'
    },
    postTime: {
        fontSize: '13px',
        color: '#94A3B8',
        fontWeight: '500'
    },
    postMenuBtn: {
        background: 'transparent',
        border: 'none',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748B',
        transition: 'all 0.2s',
        padding: 0
    },
    postMenu: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        backgroundColor: '#FFF',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        border: '1px solid #E2E8F0',
        padding: '8px',
        minWidth: '180px',
        zIndex: 100
    },
    postMenuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        color: '#475569',
        transition: 'all 0.2s'
    },
    postContent: {
        marginBottom: '16px'
    },
    postText: {
        fontSize: '15px',
        lineHeight: '1.6',
        color: '#1E293B',
        margin: '0 0 16px 0',
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const
    },
    postImagesGrid: {
        display: 'grid',
        width: '90%',
        maxWidth: '500px',
        margin: '16px auto',
        gap: '2px',
        borderRadius: '12px',
        overflow: 'hidden',
    },
    postImageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        backgroundColor: '#F1F5F9',
        cursor: 'pointer',
        overflow: 'hidden',
    },
    postImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        transition: 'transform 0.3s ease',
    },
    editPostSection: {
        marginBottom: '16px'
    },
    editTextarea: {
        width: '100%',
        padding: '12px',
        fontSize: '15px',
        borderRadius: '12px',
        border: '2px solid #E2E8F0',
        backgroundColor: '#F8FAFC',
        color: '#1E293B',
        outline: 'none',
        resize: 'vertical' as const,
        minHeight: '100px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        lineHeight: '1.6',
        transition: 'all 0.2s'
    },
    editActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '12px'
    },
    cancelEditBtn: {
        padding: '8px 16px',
        backgroundColor: '#F1F5F9',
        color: '#64748B',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    saveEditBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#007bff',
        color: '#FFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    postActions: {
        display: 'flex',
        gap: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #F1F5F9'
    },
    actionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    commentsSection: {
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #F1F5F9'
    },
    commentInputSection: {
        display: 'flex',
        gap: '12px',
        marginBottom: '16px'
    },
    commentAvatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        objectFit: 'cover' as const,
        border: '2px solid #E2E8F0',
        flexShrink: 0
    },
    commentInputWrapper: {
        flex: 1,
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
    },
    commentInput: {
        flex: 1,
        padding: '10px 16px',
        fontSize: '14px',
        borderRadius: '20px',
        border: '2px solid #E2E8F0',
        backgroundColor: '#F8FAFC',
        color: '#1E293B',
        outline: 'none',
        transition: 'all 0.2s'
    },
    sendCommentBtn: {
        width: '36px',
        height: '36px',
        backgroundColor: '#007bff',
        color: '#FFF',
        border: 'none',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        padding: 0,
        flexShrink: 0
    },
    commentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    commentItem: {
        display: 'flex',
        gap: '12px'
    },
    commentBody: {
        flex: 1,
        minWidth: 0
    },
    commentBubble: {
        backgroundColor: '#F8FAFC',
        borderRadius: '16px',
        padding: '12px 16px'
    },
    commentAuthor: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#1E293B',
        margin: '0 0 4px 0'
    },
    commentText: {
        fontSize: '14px',
        color: '#475569',
        margin: 0,
        lineHeight: '1.5',
        wordBreak: 'break-word' as const
    },
    commentMeta: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginTop: '4px',
        paddingLeft: '16px'
    },
    commentTime: {
        fontSize: '12px',
        color: '#94A3B8',
        fontWeight: '500'
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        padding: '40px 20px',
        textAlign: 'center' as const
    },
    errorTitle: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#1E293B',
        margin: '24px 0 12px 0'
    },
    errorText: {
        fontSize: '16px',
        color: '#64748B',
        marginBottom: '32px'
    },
    backBtn: {
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
    loadingFull: {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        zIndex: 1000
    }
};

export default EventCommunicationDetail;