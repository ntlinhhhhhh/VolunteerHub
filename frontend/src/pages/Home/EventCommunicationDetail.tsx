import React, { useState, useRef, useEffect } from 'react';
import {
    LayoutDashboard, Search, Users, UserCircle, Bell, Menu, ChevronLeft,
    MessageSquare, Heart, Send, Trash2, Edit2, Pin, MoreVertical,
    Image as ImageIcon, X, Loader2, LogOut, ArrowRight,
    PinOff, Check, AlertCircle, Calendar, MapPin
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// ==================== INTERFACES ====================
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

    // UI States
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showPostMenu, setShowPostMenu] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Data States
    const [userData, setUserData] = useState<UserData | null>(null);
    const [eventData, setEventData] = useState<EventData | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [inAppNotis, setInAppNotis] = useState<InAppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Loading & Logic States
    const [loading, setLoading] = useState(true);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [submittingPost, setSubmittingPost] = useState(false);
    const [eventNotFound, setEventNotFound] = useState(false);
    const [sortBy, setSortBy] = useState<'latest' | 'most_active'>('latest');
    
    // Post/Comment Form States
    const [postContent, setPostContent] = useState('');
    const [postImages, setPostImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
    const [editingPost, setEditingPost] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const notificationRef = useRef<HTMLDivElement>(null);
    const postMenuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ==================== EFFECTS ====================
    useEffect(() => {
        if (!eventId) {
            navigate('/volunteer/dashboard');
            return;
        }
        fetchUserProfile();
        fetchEventData();
        fetchPosts();
        fetchNotifications();

        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [eventId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showNotifications && notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (showPostMenu && postMenuRef.current && !postMenuRef.current.contains(event.target as Node)) {
                setShowPostMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications, showPostMenu]);

    // ==================== API FUNCTIONS ====================
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${USER_API_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                const rawData = result.data || result;
                setUserData({
                    ...rawData,
                    avatar: rawData.avatar ? (rawData.avatar.startsWith('http') ? rawData.avatar : `${USER_API_URL}${rawData.avatar}`) 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(rawData.fullName || 'User')}`
                });
            }
        } catch (e) { console.error(e); }
    };

    const fetchEventData = async () => {
        try {
            const response = await fetch(`${USER_API_URL}/events/${eventId}`);
            if (response.ok) {
                const result = await response.json();
                const event = result.data || result;
                setEventData({
                    id: event.id || event._id,
                    title: event.title,
                    description: event.description,
                    schedule: event.schedule,
                    location: event.location,
                    coverImage: event.media?.images?.[0] ? (event.media.images[0].startsWith('http') ? event.media.images[0] : `${USER_API_URL}${event.media.images[0]}`) : ''
                });
            } else if (response.status === 404) setEventNotFound(true);
        } catch (e) { setEventNotFound(true); }
        finally { setLoading(false); }
    };

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts?sortBy=${sortBy}&limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                const rawData = result.data || result;
                const postsArray = Array.isArray(rawData.posts) ? rawData.posts : [];
                const pinnedArray = Array.isArray(rawData.pinnedPosts) ? rawData.pinnedPosts : [];
                
                const allMapped = [...pinnedArray, ...postsArray].map((p: any) => ({
                    ...p,
                    id: p.id || p._id,
                    authorAvatar: p.authorAvatar ? (p.authorAvatar.startsWith('http') ? p.authorAvatar : `${USER_API_URL}${p.authorAvatar}`) 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.authorName)}`,
                    images: p.images?.map((img: string) => img.startsWith('http') ? img : `${USER_API_URL}${img}`) || []
                }));
                setPosts(allMapped);
            }
        } catch (e) { console.error(e); }
    };

    const fetchNotifications = async () => {
        setLoadingNotifications(true);
        try {
            const token = localStorage.getItem('accessToken');
            const userId = userData?._id || userData?.id;
            if (!userId) return;
            const response = await fetch(`${USER_API_URL}/notifications/${userId}?channel=in_app`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                const notis = result.data || result;
                setInAppNotis(notis.slice(0, 5));
                setUnreadCount(notis.filter((n: any) => !n.readAt).length);
            }
        } catch (e) { console.error(e); }
        finally { setLoadingNotifications(false); }
    };

    // ==================== ACTION HANDLERS ====================
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setPostImages(files);
        
        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);
    };

    const removePreviewImage = (index: number) => {
        setPostImages(prev => prev.filter((_, i) => i !== index));
        setPreviewImages(prev => {
            URL.revokeObjectURL(prev[index]); // Clean up memory
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleCreatePost = async () => {
        if (!postContent.trim()) return;
        setSubmittingPost(true);
        try {
            const formData = new FormData();
            formData.append('content', postContent);
            formData.append('eventId', eventId!);
            postImages.forEach(file => formData.append('images', file));

            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                body: formData
            });

            if (response.ok) {
                setPostContent('');
                setPostImages([]);
                previewImages.forEach(url => URL.revokeObjectURL(url));
                setPreviewImages([]);
                setShowCreatePost(false);
                fetchPosts();
            }
        } catch (e) { alert("Lỗi khi đăng bài"); }
        finally { setSubmittingPost(false); }
    };

    const handleLikePost = async (postId: string) => {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        const currentUserId = userData?.id || userData?._id || '';
        const isLiked = post.likedBy.includes(currentUserId);
        
        try {
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}/like`, {
                method: isLiked ? 'DELETE' : 'POST',
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                setPosts(prev => prev.map(p => p.id === postId ? {
                    ...p,
                    likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
                    likedBy: isLiked ? p.likedBy.filter(id => id !== currentUserId) : [...p.likedBy, currentUserId]
                } : p));
            }
        } catch (e) { console.error(e); }
    };

    const handleAddComment = async (postId: string) => {
        const content = commentInputs[postId]?.trim();
        if (!content) return;
        try {
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    authorId: userData?.id || userData?._id,
                    authorName: userData?.fullName,
                    authorAvatar: userData?.avatar?.replace(USER_API_URL, ''),
                    content
                })
            });
            if (response.ok) {
                setCommentInputs(prev => ({ ...prev, [postId]: '' }));
                fetchPosts();
            }
        } catch (e) { console.error(e); }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm('Xóa bài viết này?')) return;
        try {
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            if (response.ok) fetchPosts();
        } catch (e) { console.error(e); }
    };

    const handlePinPost = async (postId: string, isPinned: boolean) => {
        try {
            const action = isPinned ? 'unpin' : 'pin';
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}/${action}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            if (response.ok) fetchPosts();
        } catch (e) { console.error(e); }
    };

    const handleUpdatePost = async (postId: string) => {
        try {
            const response = await fetch(`${USER_API_URL}/events/${eventId}/posts/${postId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: editContent, images: [] })
            });
            if (response.ok) {
                setEditingPost(null);
                fetchPosts();
            }
        } catch (e) { console.error(e); }
    };

    // ==================== UTILS ====================
    const formatTime = (dateString: string) => {
        const diff = new Date().getTime() - new Date(dateString).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        const days = Math.floor(hrs / 24);
        if (mins < 1) return 'Vừa xong';
        if (mins < 60) return `${mins} phút trước`;
        if (hrs < 24) return `${hrs} giờ trước`;
        return days < 7 ? `${days} ngày trước` : new Date(dateString).toLocaleDateString('vi-VN');
    };

    const toggleComments = (postId: string) => {
        const next = new Set(expandedComments);
        next.has(postId) ? next.delete(postId) : next.add(postId);
        setExpandedComments(next);
    };

    const getImageGridLayout = (imageCount: number) => {
        if (imageCount === 1) return { columns: '1fr', maxHeight: '500px' };
        if (imageCount === 2) return { columns: '1fr 1fr', maxHeight: '350px' };
        if (imageCount === 3) return { columns: '1fr 1fr', maxHeight: '300px' };
        return { columns: '1fr 1fr', maxHeight: '280px' };
    };

    // ==================== RENDER HELPERS ====================
    if (loading) return <div style={styles.loadingFull}><Loader2 className="animate-spin" size={40} color="#007bff" /></div>;

    return (
        <div style={styles.layout}>
            {/* Sidebar */}
            <aside style={{...styles.sidebar, transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)'}}>
                <div style={styles.sidebarHeader}>
                    <h1 style={styles.brandTitle}>VolunteerHub</h1>
                    {isMobile && <button onClick={() => setSidebarOpen(false)} style={styles.closeBtn}><ChevronLeft /></button>}
                </div>
                <nav style={styles.navMenu}>
                    <SidebarLink icon={<LayoutDashboard size={20} />} label="Tổng quan" active />
                    <SidebarLink icon={<Search size={20} />} label="Sự kiện" onClick={() => navigate('/volunteer/events')} />
                    <SidebarLink icon={<Users size={20} />} label="Cộng đồng" />
                    <SidebarLink icon={<UserCircle size={20} />} label="Hồ sơ" />
                </nav>
                <div style={styles.sidebarFooter}>
                    <div style={styles.userCard} onClick={() => setShowLogoutPopup(!showLogoutPopup)}>
                        <img src={userData?.avatar} style={styles.sidebarAvatar} alt="avatar" />
                        <div style={styles.userInfo}>
                            <p style={styles.userName}>{userData?.fullName}</p>
                            <p style={styles.userEmail}>{userData?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{...styles.mainContent, marginLeft: isMobile ? 0 : '280px'}}>
                <header style={styles.topHeader}>
                    <div style={styles.headerLeft}>
                        {isMobile && <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}><Menu /></button>}
                        <div>
                            <h2 style={styles.headerTitle}>Thảo luận</h2>
                            <p style={styles.headerSub}>{eventData?.title}</p>
                        </div>
                    </div>
                    <div style={styles.headerRight}>
                        <div style={{ position: 'relative' }} ref={notificationRef}>
                            <button style={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)}>
                                <Bell size={20} />
                                {unreadCount > 0 && <span style={styles.notificationBadge}>{unreadCount}</span>}
                            </button>
                            {showNotifications && (
                                <div style={styles.notificationPopup}>
                                    <div style={styles.notificationHeader}>Thông báo gần đây</div>
                                    {inAppNotis.length > 0 ? inAppNotis.map(n => (
                                        <div key={n._id} style={styles.notificationItem}>
                                            <div style={styles.notificationSubject}>{n.subject}</div>
                                            <div style={styles.notificationText}>{n.content}</div>
                                        </div>
                                    )) : (
                                        <div style={styles.emptyNotification}>Không có thông báo mới</div>
                                    )}
                                </div>
                            )}
                        </div>
                        {!isMobile && <img src={userData?.avatar} style={styles.miniAvatar} alt="avatar" />}
                    </div>
                </header>

                <div style={styles.scrollArea}>
                    {/* Event Banner */}
                    <div style={{
                        ...styles.eventBanner, 
                        backgroundImage: eventData?.coverImage ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${eventData.coverImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                        <h3 style={styles.eventBannerTitle}>{eventData?.title}</h3>
                        <p style={styles.eventBannerDesc}>{eventData?.description}</p>
                        {eventData?.location?.city && (
                            <div style={styles.eventMeta}>
                                <MapPin size={16} /> {eventData.location.city}
                            </div>
                        )}
                    </div>

                    {/* Posts Feed Container - 80% width centered */}
                    <div style={styles.feedContainer}>
                        {/* Create Post */}
                        <div style={styles.createPostCard}>
                            <img src={userData?.avatar} style={styles.createPostAvatar} alt="me" />
                            <button style={styles.createPostInput} onClick={() => setShowCreatePost(true)}>
                                Bạn muốn chia sẻ điều gì về sự kiện?
                            </button>
                        </div>

                        {/* Posts List */}
                        <div style={styles.postsContainer}>
                            {posts.map(post => (
                                <div key={post.id} style={styles.postCard}>
                                    <div style={styles.postHeader}>
                                        <div style={styles.postAuthor}>
                                            <img src={post.authorAvatar} style={styles.postAvatar} alt="avt" />
                                            <div>
                                                <div style={styles.postAuthorName}>
                                                    {post.authorName}
                                                    {post.isPinned && <span style={styles.pinnedBadge}><Pin size={12} /> Ghim</span>}
                                                </div>
                                                <div style={styles.postTime}>{formatTime(post.createdAt)}</div>
                                            </div>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <button style={styles.postMenuBtn} onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}>
                                                <MoreVertical size={18} />
                                            </button>
                                            {showPostMenu === post.id && (
                                                <div style={styles.postMenu} ref={postMenuRef}>
                                                    {(userData?.id === post.authorId || userData?.role === 'event_manager') && (
                                                        <div style={{...styles.postMenuItem, color: '#EF4444'}} onClick={() => handleDeletePost(post.id)}>
                                                            <Trash2 size={16} /> Xóa bài
                                                        </div>
                                                    )}
                                                    {userData?.role === 'event_manager' && (
                                                        <div style={styles.postMenuItem} onClick={() => handlePinPost(post.id, post.isPinned)}>
                                                            <Pin size={16} /> {post.isPinned ? 'Bỏ ghim' : 'Ghim bài'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={styles.postContent}>
                                        <p style={styles.postText}>{post.content}</p>
                                        {post.images && post.images.length > 0 && (
                                            <div style={{
                                                ...styles.postImagesGrid, 
                                                gridTemplateColumns: getImageGridLayout(post.images.length).columns
                                            }}>
                                                {post.images.slice(0, 4).map((img, i) => {
                                                    const isFirstOfThree = post.images?.length === 3 && i === 0;
                                                    const isOverflow = post.images && post.images.length > 4 && i === 3;
                                                    return (
                                                        <div 
                                                            key={i} 
                                                            style={{
                                                                ...styles.postImageWrapper, 
                                                                gridColumn: isFirstOfThree ? 'span 2' : 'auto',
                                                                maxHeight: getImageGridLayout(post.images?.length || 0).maxHeight,
                                                                position: 'relative',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => setSelectedImage(img)}
                                                        >
                                                            <img src={img} style={styles.postImage} alt="post" />
                                                            {isOverflow && (
                                                                <div style={styles.imageOverlay}>
                                                                    <span style={styles.imageOverlayText}>+{post.images!.length - 4}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div style={styles.postStats}>
                                        <span style={styles.statText}>
                                            {post.likesCount > 0 && `${post.likesCount} lượt thích`}
                                        </span>
                                        <span style={styles.statText}>
                                            {post.commentsCount > 0 && `${post.commentsCount} bình luận`}
                                        </span>
                                    </div>

                                    <div style={styles.postActions}>
                                        <button 
                                            style={{
                                                ...styles.actionBtn, 
                                                color: post.likedBy.includes(userData?.id || userData?._id || '') ? '#EF4444' : '#64748B'
                                            }} 
                                            onClick={() => handleLikePost(post.id)}
                                        >
                                            <Heart 
                                                size={20} 
                                                fill={post.likedBy.includes(userData?.id || userData?._id || '') ? '#EF4444' : 'none'} 
                                            />
                                            <span>Thích</span>
                                        </button>
                                        <button style={styles.actionBtn} onClick={() => toggleComments(post.id)}>
                                            <MessageSquare size={20} />
                                            <span>Bình luận</span>
                                        </button>
                                    </div>

                                    {expandedComments.has(post.id) && (
                                        <div style={styles.commentsSection}>
                                            <div style={styles.commentInputSection}>
                                                <img src={userData?.avatar} style={styles.commentInputAvatar} alt="me" />
                                                <div style={styles.commentInputWrapper}>
                                                    <input 
                                                        style={styles.commentInput} 
                                                        placeholder="Viết bình luận..." 
                                                        value={commentInputs[post.id] || ''}
                                                        onChange={e => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                                                        onKeyPress={e => e.key === 'Enter' && handleAddComment(post.id)}
                                                    />
                                                    <button 
                                                        style={styles.sendCommentBtn} 
                                                        onClick={() => handleAddComment(post.id)}
                                                        disabled={!commentInputs[post.id]?.trim()}
                                                    >
                                                        <Send size={16}/>
                                                    </button>
                                                </div>
                                            </div>
                                            {post.comments.map(c => (
                                                <div key={c.id} style={styles.commentItem}>
                                                    <img 
                                                        src={c.authorAvatar ? (c.authorAvatar.startsWith('http') ? c.authorAvatar : `${USER_API_URL}${c.authorAvatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName)}`} 
                                                        style={styles.commentAvatar} 
                                                        alt="avt" 
                                                    />
                                                    <div style={styles.commentBody}>
                                                        <div style={styles.commentBubble}>
                                                            <div style={styles.commentAuthor}>{c.authorName}</div>
                                                            <div style={styles.commentText}>{c.content}</div>
                                                        </div>
                                                        <div style={styles.commentTime}>{formatTime(c.createdAt)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Create Post */}
            {showCreatePost && (
                <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowCreatePost(false)}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Tạo bài viết mới</h3>
                            <button style={styles.closeModalBtn} onClick={() => setShowCreatePost(false)}><X /></button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.modalAuthorRow}>
                                <img src={userData?.avatar} style={styles.modalAvatar} alt="me" />
                                <div>
                                    <div style={styles.modalAuthorName}>{userData?.fullName}</div>
                                    <div style={styles.modalPostTo}>Đăng trong sự kiện: {eventData?.title}</div>
                                </div>
                            </div>
                            <textarea 
                                style={styles.postTextarea} 
                                placeholder="Bạn đang nghĩ gì về sự kiện này?" 
                                value={postContent}
                                onChange={e => setPostContent(e.target.value)}
                                autoFocus
                            />
                            
                            {previewImages.length > 0 && (
                                <div style={styles.previewContainer}>
                                    {previewImages.map((url, i) => (
                                        <div key={i} style={styles.previewImageWrapper}>
                                            <img src={url} style={styles.previewImage} alt="preview" />
                                            <button 
                                                style={styles.removeImageBtn} 
                                                onClick={() => removePreviewImage(i)}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={styles.addToPost}>
                                <span style={styles.addToPostLabel}>Thêm vào bài viết:</span>
                                <button 
                                    style={styles.addImageBtn} 
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImageIcon size={20} color="#45C960" />
                                </button>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <button 
                                style={{
                                    ...styles.submitBtn,
                                    opacity: !postContent.trim() ? 0.5 : 1,
                                    cursor: !postContent.trim() ? 'not-allowed' : 'pointer'
                                }} 
                                onClick={handleCreatePost} 
                                disabled={submittingPost || !postContent.trim()}
                            >
                                {submittingPost ? (
                                    <><Loader2 size={18} className="animate-spin" /> Đang đăng...</>
                                ) : 'Đăng bài'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Viewer Modal */}
            {selectedImage && (
                <div style={styles.imageViewerOverlay} onClick={() => setSelectedImage(null)}>
                    <button style={styles.closeImageBtn} onClick={() => setSelectedImage(null)}>
                        <X size={24} />
                    </button>
                    <img src={selectedImage} style={styles.fullImage} alt="full size" onClick={e => e.stopPropagation()} />
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {isMobile && sidebarOpen && (
                <div style={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
};

// ==================== STYLES ====================
const SidebarLink = ({ icon, label, active = false, onClick }: any) => (
    
    <div style={active ? styles.navItemActive : styles.navItem} onClick={onClick}>
        <span style={styles.navIcon}>{icon}</span>
        <span>{label}</span>
    </div>
);

const styles: { [key: string]: React.CSSProperties } = {
    layout: { 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: '#F1F5F9', 
        width: '100vw',
        overflow: 'hidden' 
    },
    sidebar: { 
        width: '280px', 
        backgroundColor: '#FFF', 
        borderRight: '1px solid #E2E8F0', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        position: 'fixed', 
        zIndex: 100, 
        transition: 'transform 0.3s ease',
        left: 0,
        top: 0
    },
    sidebarOverlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 90
    },
    sidebarHeader: { 
        padding: '24px', 
        borderBottom: '1px solid #F1F5F9', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    brandTitle: { 
        fontSize: '22px', 
        fontWeight: '800', 
        color: '#007bff',
        margin: 0
    },
    navMenu: { 
        flex: 1, 
        padding: '16px' 
    },
    navItem: { 
        display: 'flex', 
        alignItems: 'center', 
        padding: '12px 16px', 
        color: '#64748B', 
        cursor: 'pointer', 
        borderRadius: '12px', 
        marginBottom: '4px',
        transition: 'all 0.2s',
        // ':hover': {
        //     backgroundColor: '#F8FAFC'
        // }
    },
    navItemActive: { 
        display: 'flex', 
        alignItems: 'center', 
        padding: '12px 16px', 
        color: '#007bff', 
        backgroundColor: '#EFF6FF', 
        fontWeight: '700', 
        borderRadius: '12px',
        marginBottom: '4px',
    },
    navIcon: { 
        marginRight: '12px',
        display: 'flex',
        alignItems: 'center'
    },
    sidebarFooter: { 
        padding: '20px', 
        borderTop: '1px solid #F1F5F9' 
    },
    userCard: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '10px', 
        backgroundColor: '#F8FAFC', 
        borderRadius: '12px', 
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    sidebarAvatar: { 
        width: '40px', 
        height: '40px', 
        borderRadius: '50%', 
        objectFit: 'cover' 
    },
    userInfo: {
        flex: 1,
        minWidth: 0
    },
    userName: { 
        fontSize: '14px', 
        fontWeight: '700', 
        margin: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    userEmail: { 
        fontSize: '12px', 
        color: '#94A3B8', 
        margin: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    mainContent: { 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'margin-left 0.3s ease',
        width: '100%'
    },
    topHeader: { 
        height: '70px', 
        backgroundColor: '#FFF', 
        borderBottom: '1px solid #E2E8F0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 24px', 
        position: 'sticky',
        top: 0,
        zIndex: 80
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    menuBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center'
    },
    headerTitle: { 
        fontSize: '20px', 
        fontWeight: '800', 
        margin: 0,
        color: '#0F172A'
    },
    headerSub: { 
        fontSize: '13px', 
        color: '#64748B', 
        margin: 0,
        marginTop: '2px'
    },
    iconBtn: { 
        background: '#F8FAFC', 
        border: '1px solid #E2E8F0', 
        width: '40px', 
        height: '40px', 
        borderRadius: '10px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s'
    },
    notificationBadge: {
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        backgroundColor: '#EF4444',
        color: '#FFF',
        fontSize: '11px',
        fontWeight: '700',
        padding: '2px 6px',
        borderRadius: '10px',
        minWidth: '18px',
        textAlign: 'center'
    },
    miniAvatar: { 
        width: '36px', 
        height: '36px', 
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #E2E8F0'
    },
    scrollArea: { 
        padding: '24px', 
        flex: 1, 
        overflowY: 'auto',
        overflowX: 'hidden'
    },
    eventBanner: { 
        borderRadius: '16px', 
        padding: '40px', 
        marginBottom: '24px', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        color: '#FFF',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    eventBannerTitle: { 
        fontSize: '28px', 
        fontWeight: '800', 
        marginBottom: '12px',
        margin: 0,
        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    eventBannerDesc: {
        fontSize: '15px',
        lineHeight: '1.6',
        marginBottom: '16px',
        opacity: 0.95,
        maxWidth: '800px'
    },
    eventMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '14px',
        opacity: 0.9
    },
    feedContainer: {
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%'
    },
    createPostCard: { 
        backgroundColor: '#FFF', 
        borderRadius: '16px', 
        padding: '16px', 
        display: 'flex', 
        gap: '16px', 
        alignItems: 'center', 
        border: '1px solid #E2E8F0', 
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    createPostAvatar: { 
        width: '40px', 
        height: '40px', 
        borderRadius: '50%',
        objectFit: 'cover'
    },
    createPostInput: { 
        flex: 1, 
        padding: '12px 20px', 
        borderRadius: '25px', 
        border: '1px solid #E2E8F0', 
        textAlign: 'left', 
        color: '#94A3B8', 
        backgroundColor: '#F8FAFC', 
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '15px'
    },
    postsContainer: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px' 
    },
    postCard: { 
        backgroundColor: '#FFF', 
        borderRadius: '16px', 
        padding: '20px', 
        border: '1px solid #E2E8F0', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s'
    },
    postHeader: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '16px',
        alignItems: 'flex-start'
    },
    postAuthor: { 
        display: 'flex', 
        gap: '12px'
    },
    postAvatar: { 
        width: '44px', 
        height: '44px', 
        borderRadius: '50%',
        objectFit: 'cover'
    },
    postAuthorName: { 
        fontWeight: '700', 
        fontSize: '15px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '4px',
        color: '#0F172A'
    },
    pinnedBadge: { 
        fontSize: '11px', 
        color: '#007bff', 
        backgroundColor: '#EFF6FF', 
        padding: '3px 8px', 
        borderRadius: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '600'
    },
    postTime: { 
        fontSize: '13px', 
        color: '#94A3B8' 
    },
    postMenuBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748B',
        transition: 'all 0.2s'
    },
    postContent: {
        marginBottom: '12px'
    },
    postText: { 
        fontSize: '15px', 
        lineHeight: '1.6', 
        color: '#334155', 
        marginBottom: '16px', 
        whiteSpace: 'pre-wrap',
        margin: 0
    },
    postImagesGrid: { 
        display: 'grid', 
        gap: '8px', 
        borderRadius: '12px', 
        overflow: 'hidden',
        marginTop: '12px'
    },
    postImageWrapper: { 
        aspectRatio: '16/10', 
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
        borderRadius: '8px'
    },
    postImage: { 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover',
        transition: 'transform 0.2s'
    },
    imageOverlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageOverlayText: {
        color: '#FFF',
        fontSize: '28px',
        fontWeight: '700'
    },
    postStats: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        fontSize: '13px',
        color: '#64748B',
        borderBottom: '1px solid #F1F5F9'
    },
    statText: {
        fontSize: '13px',
        color: '#64748B'
    },
    postActions: { 
        display: 'flex', 
        gap: '12px',
        paddingTop: '12px'
    },
    actionBtn: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        fontSize: '14px', 
        fontWeight: '600',
        flex: 1,
        justifyContent: 'center',
        padding: '10px',
        borderRadius: '8px',
        transition: 'background 0.2s',
        color: '#64748B'
    },
    commentsSection: { 
        marginTop: '16px', 
        borderTop: '1px solid #F1F5F9', 
        paddingTop: '16px' 
    },
    commentInputSection: { 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '16px',
        alignItems: 'flex-start'
    },
    commentInputAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        objectFit: 'cover',
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
        borderRadius: '20px', 
        border: '1px solid #E2E8F0', 
        outline: 'none',
        fontSize: '14px',
        backgroundColor: '#F8FAFC',
        transition: 'all 0.2s'
    },
    sendCommentBtn: { 
        backgroundColor: '#007bff', 
        color: '#FFF', 
        border: 'none', 
        borderRadius: '50%', 
        width: '36px', 
        height: '36px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.2s',
        padding: 0
    },
    commentItem: { 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '12px',
        alignItems: 'flex-start'
    },
    commentAvatar: { 
        width: '32px', 
        height: '32px', 
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0
    },
    commentBody: {
        flex: 1,
        minWidth: 0
    },
    commentBubble: { 
        backgroundColor: '#F1F5F9', 
        borderRadius: '16px', 
        padding: '10px 14px',
        display: 'inline-block',
        maxWidth: '100%'
    },
    commentAuthor: { 
        fontWeight: '700', 
        fontSize: '13px',
        marginBottom: '2px',
        color: '#0F172A'
    },
    commentText: { 
        fontSize: '14px',
        lineHeight: '1.5',
        color: '#334155',
        wordWrap: 'break-word'
    },
    commentTime: { 
        fontSize: '11px', 
        color: '#94A3B8', 
        marginTop: '6px', 
        paddingLeft: '8px' 
    },
    modalOverlay: { 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(63, 63, 63, 0.6)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 200,
        padding: '20px'
    },
    modalContent: { 
        backgroundColor: '#FFF', 
        borderRadius: '16px', 
        width: '100%',
        maxWidth: '600px', 
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
    },
    modalHeader: {
        padding: '20px 24px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: '20px',
        fontWeight: '700',
        margin: 0,
        color: '#0F172A'
    },
    closeModalBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '8px',
        transition: 'background 0.2s'
    },
    modalBody: {
        padding: '24px',
        flex: 1,
        overflowY: 'auto'
    },
    modalAuthorRow: {
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        alignItems: 'center'
    },
    modalAvatar: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        objectFit: 'cover'
    },
    modalAuthorName: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#0F172A'
    },
    modalPostTo: {
        fontSize: '13px',
        color: '#64748B',
        marginTop: '2px'
    },
    postTextarea: { 
        width: '100%', 
        minHeight: '150px', 
        border: 'none',
        outline: 'none',
        padding: '12px 0',
        fontSize: '15px',
        resize: 'none',
        fontFamily: 'inherit',
        lineHeight: '1.6'
    },
    previewContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px',
        marginTop: '16px'
    },
    previewImageWrapper: {
        position: 'relative',
        aspectRatio: '1',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#F1F5F9'
    },
    previewImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    removeImageBtn: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: '#FFF',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    addToPost: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginTop: '16px',
        padding: '12px',
        border: '1px solid #E2E8F0',
        borderRadius: '8px'
    },
    addToPostLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#0F172A',
        flex: 1
    },
    addImageBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.2s'
    },
    modalFooter: {
        padding: '16px 24px',
        borderTop: '1px solid #E2E8F0'
    },
    submitBtn: { 
        width: '100%', 
        padding: '12px', 
        backgroundColor: '#007bff', 
        color: '#FFF', 
        border: 'none', 
        borderRadius: '12px', 
        fontWeight: '700',
        fontSize: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'background 0.2s'
    },
    loadingFull: { 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#F1F5F9'
    },
    postMenu: { 
        position: 'absolute', 
        right: 0, 
        top: '100%', 
        backgroundColor: '#FFF', 
        border: '1px solid #E2E8F0', 
        borderRadius: '12px', 
        padding: '6px', 
        zIndex: 10, 
        minWidth: '160px', 
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        marginTop: '4px'
    },
    postMenuItem: { 
        padding: '10px 12px', 
        cursor: 'pointer', 
        fontSize: '14px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        borderRadius: '8px',
        transition: 'background 0.2s',
        fontWeight: '500'
    },
    notificationPopup: { 
        position: 'absolute', 
        top: '50px', 
        right: 0, 
        width: '360px', 
        maxWidth: '90vw',
        backgroundColor: '#FFF', 
        border: '1px solid #E2E8F0', 
        borderRadius: '12px', 
        padding: '12px', 
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)', 
        zIndex: 100,
        maxHeight: '400px',
        overflowY: 'auto'
    },
    notificationHeader: {
        fontSize: '16px',
        fontWeight: '700',
        padding: '12px',
        color: '#0F172A'
    },
    notificationItem: { 
        padding: '12px', 
        borderBottom: '1px solid #F1F5F9',
        cursor: 'pointer',
        borderRadius: '8px',
        transition: 'background 0.2s'
    },
    notificationSubject: { 
        fontWeight: '600', 
        fontSize: '14px',
        marginBottom: '4px',
        color: '#0F172A'
    },
    notificationText: { 
        fontSize: '13px', 
        color: '#64748B',
        lineHeight: '1.5'
    },
    emptyNotification: {
        padding: '32px 12px',
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: '14px'
    },
    imageViewerOverlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        padding: '20px'
    },
    closeImageBtn: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: '#FFF',
        border: 'none',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s',
        backdropFilter: 'blur(10px)',
        padding: 0
    },
    fullImage: {
        maxWidth: '90%',
        maxHeight: '90%',
        objectFit: 'contain',
        borderRadius: '8px'
    }
};

// Add media query styles
const mediaQueries = `
@media (max-width: 1024px) {
    .feed-container {
        max-width: 100% !important;
    }
}

@media (max-width: 768px) {
    .post-card {
        padding: 16px !important;
    }
    .event-banner {
        padding: 24px !important;
    }
}
`;

export default EventCommunicationDetail;