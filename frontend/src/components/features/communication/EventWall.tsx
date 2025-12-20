import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Heart, MessageCircle, MoreVertical, MapPin,
  Users, Calendar, Image as ImageIcon, X,
  ChevronDown, Check, Bell, User, Pin,
  Edit3, Search, Shield, BadgeCheck, Video, Trash2
} from 'lucide-react';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  pinPost,
  unpinPost,
  addComment,
  updateComment,
  deleteComment,
  type BackendPost,
  type BackendComment
} from '../../../services/communication.service';
import { getEventParticipants, type BackendRegistration } from '../../../services/event-registration.service';
import { getEventById, type BackendEvent } from '../../../services/event.service';

// --- Type Definitions ---
interface Post {
  id: number;
  type: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    roleColor: string;
  };
  content: string;
  time: string;
  likes: number;
  comments: Comment[];
  images: string[];
  isLiked: boolean;
  backendId?: string; // Backend post ID for API calls
  eventId?: string;
  authorId?: string;
}

interface Comment {
  id: number;
  author: string;
  avatar?: string;
  content: string;
  time: string;
  likes: number;
  backendId?: string; // Backend comment ID for API calls
  authorId?: string;
}

interface Member {
  id: number;
  name: string;
  role: string;
  avatar: string;
  email: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

// --- Theme Configuration & Mock Data ---

const THEME = {
  colors: {
    primaryDark: '#34729C',
    primary: '#6CBDDA',
    primaryLight: '#D1ECFF',
    primaryDeep: '#1E5470',
    accent: '#5FC1D1',
    accentLight: '#CBF1F5',
    warning: '#F59E0B',
    success: '#10B981',
    error: '#EF4444',
    textDark: '#212529',
    textGray: '#6C757D',
    bgLight: '#F8F9FA',
    white: '#FFFFFF',
  }
};

const MOCK_USER: User = {
  id: 'me',
  name: 'Nguyễn Văn A',
  avatar: 'https://i.pravatar.cc/150?img=11',
  role: 'Volunteer'
};

const MOCK_MEMBERS: Member[] = [
  { id: 1, name: 'Trần Quản Lý', role: 'Event Manager', avatar: 'https://i.pravatar.cc/150?img=33', email: 'manager@event.com', status: 'Online' },
  { id: 2, name: 'Lê Điều Phối', role: 'Volunteer', avatar: 'https://i.pravatar.cc/150?img=12', email: 'coor@event.com', status: 'Offline' },
  { id: 3, name: 'Nguyễn Văn A', role: 'Volunteer', avatar: 'https://i.pravatar.cc/150?img=11', email: 'nguyenvana@gmail.com', status: 'Online' },
  { id: 4, name: 'Phạm Minh Tú', role: 'Volunteer', avatar: 'https://i.pravatar.cc/150?img=5', email: 'tupm@gmail.com', status: 'Online' },
  { id: 5, name: 'Hoàng Văn C', role: 'Volunteer', avatar: 'https://i.pravatar.cc/150?img=8', email: 'hoangc@gmail.com', status: 'Offline' },
  { id: 6, name: 'Đỗ Thị D', role: 'Volunteer', avatar: 'https://i.pravatar.cc/150?img=9', email: 'dothi@gmail.com', status: 'Offline' },
  { id: 7, name: 'Vũ Văn E', role: 'Volunteer', avatar: 'https://i.pravatar.cc/150?img=60', email: 'vue@gmail.com', status: 'Online' },
];

// MOCK_POSTS removed - using real API data now
const MOCK_POSTS_LEGACY: Post[] = [
  {
    id: 1,
    type: 'pinned',
    author: {
      name: 'Trần Quản Lý',
      avatar: 'https://i.pravatar.cc/150?img=33',
      role: 'Event Manager',
      roleColor: THEME.colors.primaryDark
    },
    content: '**Thông báo quan trọng:** Lịch trình sự kiện ngày 25/12 đã được cập nhật. Vui lòng kiểm tra email để biết thêm chi tiết về vị trí tập kết mới.',
    time: '2 giờ trước',
    likes: 156,
    comments: [
      { id: 101, author: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=5', content: 'Đã nhận được thông tin ạ!', time: '1h', likes: 5 }
    ],
    images: [],
    isLiked: false
  },
  {
    id: 2,
    type: 'regular',
    author: {
      name: 'Lê Hoàng Nam',
      avatar: 'https://i.pravatar.cc/150?img=68',
      role: 'Volunteer',
      roleColor: THEME.colors.accent
    },
    content: 'Check-in sớm tại địa điểm! Không khí đang rất nóng 🔥 Mọi người nhớ mang theo thẻ đeo nhé. #EventHanoi #Volunteers',
    time: '30 phút trước',
    likes: 45,
    comments: [],
    images: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
    ],
    isLiked: true
  },
  {
    id: 3,
    type: 'regular',
    author: {
      name: 'Phạm Minh Tú',
      avatar: 'https://i.pravatar.cc/150?img=12',
      role: 'Volunteer',
      roleColor: THEME.colors.accent
    },
    content: 'Cần tìm đồng đội đi chung từ khu vực Cầu Giấy ạ. Ai đi qua đón mình với 🚗',
    time: '1 giờ trước',
    likes: 12,
    comments: [
      { id: 201, author: 'Hoàng Văn C', avatar: 'https://i.pravatar.cc/150?img=8', content: 'Mình đi qua nè, inbox nhé!', time: '45p', likes: 2 },
      { id: 202, author: 'Phạm Minh Tú', avatar: 'https://i.pravatar.cc/150?img=12', content: 'Ok bác ơi', time: '10p', likes: 1 }
    ],
    images: [],
    isLiked: false
  }
];

// --- Custom Components ---

const Avatar = ({ src, size = 'md', className = '' }: { src: string; size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'; className?: string }) => {
  const sizeClasses: Record<'sm' | 'md' | 'lg' | 'xl' | 'xxl', string> = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    xxl: 'w-24 h-24'
  };

  return (
    <img
      src={src}
      alt="User Avatar"
      className={`${sizeClasses[size]} rounded-full object-cover border-2 border-[${THEME.colors.primary}] ${className}`}
      style={{ borderColor: THEME.colors.primary }}
    />
  );
};

const Badge = ({ text, color, className = '' }: { text: string; color?: string; className?: string }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-medium text-white flex items-center ${className}`}
    style={{ backgroundColor: color || THEME.colors.textGray }}
  >
    {text}
  </span>
);

const Button = ({ children, variant = 'primary', className = '', onClick, disabled }: { children: React.ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'success'; className?: string; onClick?: () => void; disabled?: boolean }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants: Record<'primary' | 'secondary' | 'ghost' | 'success', string> = {
    primary: `text-white shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50`,
    secondary: `bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95`,
    ghost: `bg-transparent hover:bg-gray-100 text-gray-600`,
    success: `bg-green-100 text-green-700 border border-green-200 cursor-default`
  };

  const gradientStyle = variant === 'primary' ? {
    background: `linear-gradient(135deg, ${THEME.colors.primaryDark} 0%, ${THEME.colors.primaryDeep} 100%)`
  } : {};

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      style={gradientStyle}
    >
      {children}
    </button>
  );
};

// Helper function to convert backend post to frontend post
const convertBackendPostToPost = (backendPost: BackendPost, currentUserId: string): Post => {
  const isLiked = backendPost.likedBy.includes(currentUserId);
  const timeAgo = getTimeAgo(backendPost.createdAt);
  
  return {
    id: parseInt(backendPost.id) || Date.now(),
    type: backendPost.isPinned ? 'pinned' : 'regular',
    author: {
      name: backendPost.authorName,
      avatar: backendPost.authorAvatar || `https://i.pravatar.cc/150?img=${backendPost.authorId}`,
      role: 'Volunteer', // TODO: Get from user service
      roleColor: THEME.colors.accent
    },
    content: backendPost.content,
    time: timeAgo,
    likes: backendPost.likesCount,
    comments: backendPost.comments.map(convertBackendCommentToComment),
    images: backendPost.images,
    isLiked,
    backendId: backendPost.id, // Store backend ID for API calls
    eventId: backendPost.eventId,
    authorId: backendPost.authorId
  };
};

const convertBackendCommentToComment = (backendComment: BackendComment): Comment => {
  return {
    id: parseInt(backendComment.id) || Date.now(),
    author: backendComment.authorName,
    avatar: backendComment.authorAvatar || undefined,
    content: backendComment.content,
    time: getTimeAgo(backendComment.createdAt),
    likes: 0, // Backend doesn't have comment likes yet
    backendId: backendComment.id,
    authorId: backendComment.authorId
  };
};

const convertBackendRegistrationToMember = (backendRegistration: BackendRegistration): Member => {
  return {
    id: parseInt(backendRegistration.volunteerId) || Date.now(),
    name: backendRegistration.volunteerName,
    role: backendRegistration.roleName,
    avatar: `https://i.pravatar.cc/150?img=${backendRegistration.volunteerId}`,
    email: backendRegistration.volunteerEmail,
    status: backendRegistration.status === 'checked_in' ? 'Online' : 'Offline'
  };
};

// Helper function to get time ago string
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

// --- Main Application Component ---

export default function EventWallApp() {
  const { id: eventId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('wall');
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [event, setEvent] = useState<BackendEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [notifications, setNotifications] = useState<{ id: number; type: string; message: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [isEventLoading, setIsEventLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'most_active'>('latest');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentUserId = localStorage.getItem('userId') || 'mock-user-id';
  const currentUserRole = localStorage.getItem('userRole') || 'volunteer';
  const isEventManager = currentUserRole === 'event_manager' || currentUserRole === 'admin';

  // Load posts, members, and event data on mount
  useEffect(() => {
    if (eventId) {
      loadPosts();
      loadMembers();
      loadEvent();
    }
  }, [eventId]);

  // Reload posts when sortBy changes
  useEffect(() => {
    if (eventId) {
      loadPosts();
    }
  }, [sortBy]);

  const loadPosts = async () => {
    if (!eventId) return;

    setIsLoading(true);
    setError(null);
    try {
      const backendPosts = await getPosts(eventId, 20, 0, sortBy);
      const convertedPosts = backendPosts.map(post => convertBackendPostToPost(post, currentUserId));
      setPosts(convertedPosts);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      addNotification('error', 'Lỗi khi tải bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!eventId) return;

    setIsMembersLoading(true);
    try {
      const backendRegistrations = await getEventParticipants(eventId);
      const convertedMembers = backendRegistrations.map(convertBackendRegistrationToMember);
      setMembers(convertedMembers);
    } catch (err) {
      console.error('Error loading members:', err);
      // Don't show error notification for members, just use empty list
      setMembers([]);
    } finally {
      setIsMembersLoading(false);
    }
  };

  const loadEvent = async () => {
    if (!eventId) return;

    setIsEventLoading(true);
    try {
      const backendEvent = await getEventById(eventId);
      setEvent(backendEvent);
    } catch (err) {
      console.error('Error loading event:', err);
      // Don't show error notification for event, just use null
      setEvent(null);
    } finally {
      setIsEventLoading(false);
    }
  };

  const addNotification = (type: string, message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleCreatePost = async (content: string, images?: string[]) => {
    if (!eventId) return;

    setIsSubmitting(true);
    try {
      const newBackendPost = await createPost(eventId, content, images || []);
      const newPost = convertBackendPostToPost(newBackendPost, currentUserId);
      setPosts([newPost, ...posts]);
      setIsCreateModalOpen(false);
      addNotification('success', 'Đã đăng bài viết thành công!');
    } catch (err) {
      console.error('Error creating post:', err);
      addNotification('error', 'Không thể đăng bài viết. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = async (content: string, images?: string[]) => {
    if (!eventId || !editingPost?.backendId) return;

    setIsSubmitting(true);
    try {
      const updatedBackendPost = await updatePost(eventId, editingPost.backendId, content, images || []);
      const updatedPost = convertBackendPostToPost(updatedBackendPost, currentUserId);
      setPosts(posts.map(p => p.backendId === editingPost.backendId ? updatedPost : p));
      setIsEditModalOpen(false);
      setEditingPost(null);
      addNotification('success', 'Đã cập nhật bài viết thành công!');
    } catch (err) {
      console.error('Error updating post:', err);
      addNotification('error', 'Không thể cập nhật bài viết. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (post: Post) => {
    if (!eventId || !post.backendId) return;
    
    try {
      if (post.isLiked) {
        await unlikePost(eventId, post.backendId);
        setPosts(posts.map(p => 
          p.backendId === post.backendId 
            ? { ...p, isLiked: false, likes: Math.max(0, p.likes - 1) }
            : p
        ));
      } else {
        await likePost(eventId, post.backendId);
        setPosts(posts.map(p => 
          p.backendId === post.backendId 
            ? { ...p, isLiked: true, likes: p.likes + 1 }
            : p
        ));
        addNotification('like', `Bạn đã thích bài viết của ${post.author.name}`);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      addNotification('error', 'Không thể thực hiện thao tác. Vui lòng thử lại.');
    }
  };

  const handleDeletePost = async (post: Post) => {
    if (!eventId || !post.backendId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    
    try {
      await deletePost(eventId, post.backendId);
      setPosts(posts.filter(p => p.backendId !== post.backendId));
      if (selectedPost?.backendId === post.backendId) {
        setSelectedPost(null);
      }
      addNotification('success', 'Đã xóa bài viết thành công!');
    } catch (err) {
      console.error('Error deleting post:', err);
      addNotification('error', 'Không thể xóa bài viết. Vui lòng thử lại.');
    }
  };

  const handlePinPost = async (post: Post) => {
    if (!eventId || !post.backendId) return;
    
    try {
      if (post.type === 'pinned') {
        await unpinPost(eventId, post.backendId);
        setPosts(posts.map(p => 
          p.backendId === post.backendId ? { ...p, type: 'regular' } : p
        ));
        addNotification('success', 'Đã bỏ ghim bài viết');
      } else {
        await pinPost(eventId, post.backendId);
        setPosts(posts.map(p => 
          p.backendId === post.backendId ? { ...p, type: 'pinned' } : p
        ));
        addNotification('success', 'Đã ghim bài viết');
      }
    } catch (err) {
      console.error('Error pinning post:', err);
      addNotification('error', 'Không thể thực hiện thao tác. Vui lòng thử lại.');
    }
  };

  const handleAddComment = async (post: Post, content: string) => {
    if (!eventId || !post.backendId) return;
    
    try {
      const newComment = await addComment(eventId, post.backendId, content);
      const convertedComment = convertBackendCommentToComment(newComment);
      setPosts(posts.map(p => 
        p.backendId === post.backendId 
          ? { ...p, comments: [...p.comments, convertedComment], likes: p.likes } 
          : p
      ));
      if (selectedPost?.backendId === post.backendId) {
        setSelectedPost({ ...selectedPost, comments: [...selectedPost.comments, convertedComment] });
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      addNotification('error', 'Không thể thêm bình luận. Vui lòng thử lại.');
    }
  };

  const handleDeleteComment = async (post: Post, comment: Comment) => {
    if (!eventId || !post.backendId || !comment.backendId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    
    try {
      await deleteComment(eventId, post.backendId, comment.backendId);
      setPosts(posts.map(p => 
        p.backendId === post.backendId 
          ? { ...p, comments: p.comments.filter(c => c.backendId !== comment.backendId) }
          : p
      ));
      if (selectedPost?.backendId === post.backendId) {
        setSelectedPost({
          ...selectedPost,
          comments: selectedPost.comments.filter(c => c.backendId !== comment.backendId)
        });
      }
      addNotification('success', 'Đã xóa bình luận');
    } catch (err) {
      console.error('Error deleting comment:', err);
      addNotification('error', 'Không thể xóa bình luận. Vui lòng thử lại.');
    }
  };

  const handleUpdateComment = async (post: Post, comment: Comment, newContent: string) => {
    if (!eventId || !post.backendId || !comment.backendId) return;
    
    try {
      await updateComment(eventId, post.backendId, comment.backendId, newContent);
      setPosts(posts.map(p => 
        p.backendId === post.backendId 
          ? {
              ...p,
              comments: p.comments.map(c => 
                c.backendId === comment.backendId 
                  ? { ...c, content: newContent }
                  : c
              )
            }
          : p
      ));
      if (selectedPost?.backendId === post.backendId) {
        setSelectedPost({
          ...selectedPost,
          comments: selectedPost.comments.map(c => 
            c.backendId === comment.backendId 
              ? { ...c, content: newContent }
              : c
          )
        });
      }
      addNotification('success', 'Đã cập nhật bình luận');
    } catch (err) {
      console.error('Error updating comment:', err);
      addNotification('error', 'Không thể cập nhật bình luận. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800" style={{ backgroundColor: '#F0F2F5' }}>
      
      {/* --- Notification Toast Container --- */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {notifications.map(notif => (
          <div 
            key={notif.id}
            className="pointer-events-auto bg-white p-4 rounded-xl shadow-xl border-l-4 w-80 animate-slide-in flex items-start justify-between"
            style={{ 
              borderColor: 
                notif.type === 'success' ? THEME.colors.success :
                notif.type === 'like' ? THEME.colors.error : 
                THEME.colors.primary 
            }}
          >
            <div>
              <h4 className="font-semibold text-sm mb-1">Thông báo mới</h4>
              <p className="text-sm text-gray-600">{notif.message}</p>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* --- Header Navigation --- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: THEME.colors.primaryDark }}>
              E
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800 hidden sm:block">Event Connect</h1>
          </div>

          {/* Center Tabs */}
          <nav className="flex items-center gap-1 sm:gap-6">
            {['wall', 'members'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors capitalize
                  ${activeTab === tab ? 'text-blue-700' : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                {tab === 'wall' && 'Bảng Tin'}
                {tab === 'members' && 'Thành Viên'}
                {activeTab === tab && (
                  <span 
                    className="absolute bottom-[-1.3rem] left-0 w-full h-1 rounded-t-full transition-all duration-300" 
                    style={{ backgroundColor: THEME.colors.accent }}
                  />
                )}
              </button>
            ))}
            {activeTab === 'wall' && (
              <div className="ml-4 flex gap-2">
                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    sortBy === 'latest' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => setSortBy('most_active')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    sortBy === 'most_active' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Nổi bật
                </button>
              </div>
            )}
          </nav>

          {/* Right: Dashboard Style User Info */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
            </button>
            
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            {/* User Profile Dropdown Trigger */}
            <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
              <Avatar src={localStorage.getItem('userAvatar') || MOCK_USER.avatar} size="sm" />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-gray-800 leading-none">{localStorage.getItem('userName') || MOCK_USER.name}</div>
                <div className="text-[10px] font-medium text-blue-600 leading-tight mt-1">{currentUserRole === 'event_manager' ? 'Event Manager' : currentUserRole === 'admin' ? 'Admin' : 'Volunteer'}</div>
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-20">
        
        {/* Only show Banner on Wall tab */}
        {activeTab === 'wall' && (
          <div className="relative w-full h-48 sm:h-64 rounded-[24px] overflow-hidden shadow-lg mb-8 group cursor-pointer">
            <img
              src={event?.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Event Cover"
            />
            <div
              className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8"
              style={{ background: `linear-gradient(to top, ${THEME.colors.primaryDeep} 90%, transparent)` }}
            >
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white w-fit mb-2 border border-white/30">
                {event?.category || 'Sự kiện'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 drop-shadow-md">{event?.title || 'Đang tải...'}</h2>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm sm:text-base">
                <div className="flex items-center gap-1.5"><Calendar size={16} /> {event ? new Date(event.startDate).toLocaleDateString('vi-VN') : 'Đang tải...'}</div>
                <div className="flex items-center gap-1.5"><MapPin size={16} /> {event?.location || 'Đang tải...'}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* --- Left Sidebar (Always Visible on Desktop) --- */}
          <aside className="hidden lg:block w-1/4 space-y-6">
            <SidebarCard title="Thông Tin Sự Kiện">
              <div className="space-y-4">
                <InfoRow
                  icon={<Calendar size={18} />}
                  label="Thời gian"
                  value={event ? `${new Date(event.startDate).toLocaleDateString('vi-VN')} - ${new Date(event.endDate).toLocaleDateString('vi-VN')}` : 'Đang tải...'}
                />
                <InfoRow
                  icon={<MapPin size={18} />}
                  label="Địa điểm"
                  value={event?.location || 'Đang tải...'}
                />
                <InfoRow
                  icon={<Users size={18} />}
                  label="Tham gia"
                  value={event ? `${event.currentParticipants}/${event.maxParticipants} người` : 'Đang tải...'}
                />

                {/* Updated Button: 'Đã tham gia' implies approved */}
                <Button variant="success" className="w-full mt-2 text-sm justify-center">
                  <Check size={16} /> Đã tham gia
                </Button>
              </div>
            </SidebarCard>

            <SidebarCard title="Thống Kê Nhanh">
              <div className="grid grid-cols-2 gap-4">
                <StatBox label="Bài viết" value={posts.length} />
                <StatBox label="Thành viên" value={members.length} />
                <StatBox label="Lượt thích" value={posts.reduce((sum, post) => sum + post.likes, 0)} />
                <StatBox label="Bình luận" value={posts.reduce((sum, post) => sum + post.comments.length, 0)} />
              </div>
            </SidebarCard>
          </aside>

          {/* --- Dynamic Center Content --- */}
          <div className="flex-1 lg:w-3/4 w-full">
            
            {activeTab === 'wall' ? (
              // --- WALL FEED CONTENT ---
              <>
                {/* Create Post Composer */}
                <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 mb-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-3 mb-4">
                    <Avatar src={MOCK_USER.avatar} />
                    <button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-left px-4 py-3 rounded-xl text-gray-500 transition-colors border-2 border-transparent focus:outline-none focus:border-blue-200"
                    >
                      {MOCK_USER.name} ơi, bạn đang nghĩ gì thế?
                    </button>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-3 px-2">
                    <div className="flex gap-2">
                      <ActionIcon label="Thêm ảnh" icon={<ImageIcon size={20} className="text-green-500" />} />
                      <ActionIcon label="Thêm video" icon={<Video size={20} className="text-red-500" />} />
                    </div>
                  </div>
                </div>

                {/* Posts List */}
                {error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-600">{error}</p>
                    <button 
                      onClick={loadPosts}
                      className="mt-2 text-sm text-red-700 hover:underline"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : isLoading ? (
                  <div className="space-y-4">
                    <PostSkeleton />
                    <PostSkeleton />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white rounded-[16px] p-12 text-center border border-gray-100">
                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-lg font-medium">Chưa có bài viết nào</p>
                    <p className="text-gray-400 text-sm mt-2">Hãy là người đầu tiên chia sẻ!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map(post => (
                      <PostCard
                        key={post.backendId || post.id}
                        post={post}
                        onLike={() => toggleLike(post)}
                        onCommentClick={() => setSelectedPost(post)}
                        onEdit={post.authorId === currentUserId ? () => {
                          setEditingPost(post);
                          setIsEditModalOpen(true);
                        } : undefined}
                        onDelete={isEventManager || post.authorId === currentUserId ? () => handleDeletePost(post) : undefined}
                        onPin={isEventManager ? () => handlePinPost(post) : undefined}
                        isEventManager={isEventManager}
                        isOwner={post.authorId === currentUserId}
                      />
                    ))}
                    <div className="py-8 flex justify-center text-sm text-gray-400 font-medium">
                      ~ Đã hiển thị hết tin mới ~
                    </div>
                  </div>
                )}
              </>
            ) : (
              // --- MEMBERS LIST CONTENT ---
              <MembersList members={members} isLoading={isMembersLoading} />
            )}
          </div>

        </div>
      </main>

      {/* --- Mobile Bottom Nav --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <NavIcon icon={<Users size={24} />} active={activeTab === 'members'} onClick={() => setActiveTab('members')} />
        
        <div className="relative -top-8">
           <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transform transition-transform active:scale-95"
            style={{ background: `linear-gradient(135deg, ${THEME.colors.primaryDark}, ${THEME.colors.primary})` }}
           >
             <Edit3 size={24} />
           </button>
        </div>
        
        <NavIcon icon={<Bell size={24} />} active={false} />
      </div>

      {/* --- Modals --- */}
      {isCreateModalOpen && (
        <CreatePostModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSubmit={handleCreatePost} 
          user={{
            id: currentUserId,
            name: localStorage.getItem('userName') || MOCK_USER.name,
            avatar: localStorage.getItem('userAvatar') || MOCK_USER.avatar,
            role: currentUserRole
          }}
          isSubmitting={isSubmitting}
        />
      )}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={() => toggleLike(selectedPost)}
          onAddComment={(content) => handleAddComment(selectedPost, content)}
          onDeleteComment={(comment) => handleDeleteComment(selectedPost, comment)}
          onUpdateComment={(comment, newContent) => handleUpdateComment(selectedPost, comment, newContent)}
          currentUserId={currentUserId}
          isEventManager={isEventManager}
        />
      )}

      {isEditModalOpen && editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPost(null);
          }}
          onSubmit={handleEditPost}
          user={{
            id: currentUserId,
            name: localStorage.getItem('userName') || MOCK_USER.name,
            avatar: localStorage.getItem('userAvatar') || MOCK_USER.avatar,
            role: currentUserRole
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* --- Global Styles --- */}
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .animate-heart-pop {
          animation: heartPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.4s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// --- Sub-Components ---

function MembersList({ members, isLoading = false }: { members: Member[]; isLoading?: boolean }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-slide-in">
        {/* Search Skeleton */}
        <div className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="flex-1 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Managers Section Skeleton */}
        <div className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-gray-100">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="divide-y divide-gray-50 p-4 space-y-4">
            <MemberSkeleton />
            <MemberSkeleton />
          </div>
        </div>

        {/* Volunteers Section Skeleton */}
        <div className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-gray-100">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="divide-y divide-gray-50 p-4 space-y-4">
            <MemberSkeleton />
            <MemberSkeleton />
            <MemberSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const managers = members.filter((m: Member) => m.role === 'Event Manager');
  const volunteers = members.filter((m: Member) => m.role !== 'Event Manager');

  const filteredManagers = managers.filter((m: Member) => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredVolunteers = volunteers.filter((m: Member) => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-slide-in">
       {/* Search Header */}
       <div className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 flex items-center gap-3">
         <Search className="text-gray-400" size={20} />
         <input
           type="text"
           placeholder="Tìm kiếm thành viên..."
           className="flex-1 outline-none text-gray-700 placeholder-gray-400"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
       </div>

       {/* Managers Section */}
       <div className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-gray-100">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 flex items-center gap-2">
             <Shield className="text-blue-600" size={20} />
             <h3 className="font-bold text-gray-800">Ban Tổ Chức (Event Managers)</h3>
             <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">{managers.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
             {filteredManagers.map((member: Member) => (
                <MemberRow key={member.id} member={member} isManager />
             ))}
          </div>
       </div>

       {/* Volunteers Section */}
       <div className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-gray-100">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
             <Users className="text-gray-600" size={20} />
             <h3 className="font-bold text-gray-800">Tình Nguyện Viên & Thành Viên</h3>
             <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">{volunteers.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
             {filteredVolunteers.length > 0 ? (
                filteredVolunteers.map((member: Member) => (
                   <MemberRow key={member.id} member={member} />
                ))
             ) : (
                <div className="p-8 text-center text-gray-400 text-sm">Không tìm thấy thành viên nào.</div>
             )}
          </div>
       </div>
    </div>
  );
}

function MemberRow({ member, isManager }: { member: Member; isManager?: boolean }) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4">
           <div className="relative">
              <Avatar src={member.avatar} />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${member.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
           </div>
           <div>
              <div className="font-semibold text-gray-800 flex items-center gap-2">
                 {member.name}
                 {isManager && <BadgeCheck size={16} className="text-blue-500" fill="transparent" />}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                 <span className={isManager ? 'text-blue-600 font-medium' : ''}>{member.role}</span>
                 <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                 <span className="truncate max-w-[150px]">{member.email}</span>
              </div>
           </div>
        </div>
    </div>
  );
}

function MemberSkeleton() {
  return (
    <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
           <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-48"></div>
           </div>
        </div>
    </div>
  );
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider border-b border-gray-100 pb-2">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="text-gray-400">{icon}</div>
      <div>
        <div className="text-gray-500 text-xs">{label}</div>
        <div className="font-medium text-gray-800">{value}</div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg text-center">
      <div className="font-bold text-xl" style={{ color: THEME.colors.primaryDark }}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function ActionIcon({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 text-sm transition-colors">
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function NavIcon({ icon, active, onClick }: { icon: React.ReactNode; active: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition-colors ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
    >
      {icon}
    </button>
  );
}

// --- Post Card Component ---

function PostCard({
  post,
  onLike,
  onCommentClick,
  onEdit,
  onDelete,
  onPin,
  isEventManager,
  isOwner
}: {
  post: Post;
  onLike: () => void;
  onCommentClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  isEventManager?: boolean;
  isOwner?: boolean;
}) {
  const isPinned = post.type === 'pinned';
  const [showMenu, setShowMenu] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    if (showMenu) {
      const handleClickOutside = () => setShowMenu(false);
      setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div
      className={`bg-white rounded-[16px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
        ${isPinned ? 'border-l-4' : 'border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'}
      `}
      style={isPinned ? {
        borderLeftColor: THEME.colors.warning,
        background: `linear-gradient(135deg, ${THEME.colors.primaryLight}20 0%, #FFFFFF 100%)`
      } : {}}
    >
      <div className="p-5">
        {/* Post Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3">
            <Avatar src={post.author.avatar} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                <Badge text={post.author.role} color={post.author.roleColor} />
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                {post.time}
                {isPinned && <span className="text-orange-500 font-medium flex items-center gap-1 ml-2"><Pin size={12} fill="currentColor" /> Đã ghim</span>}
              </div>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[150px]">
                {isOwner && onEdit && (
                  <button
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Edit3 size={16} />
                    Chỉnh sửa bài viết
                  </button>
                )}
                {isEventManager && (
                  <button
                    onClick={() => {
                      onPin?.();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Pin size={16} />
                    {isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                  </button>
                )}
                {(isOwner || isEventManager) && onDelete && (
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Xóa bài viết
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="text-gray-800 text-[15px] leading-relaxed mb-4 whitespace-pre-line">
            {post.content.split(' ').map((word: string, idx: number) => {
              if (word.startsWith('#')) return <span key={idx} className="font-semibold cursor-pointer hover:underline" style={{color: THEME.colors.primaryDark}}>{word} </span>;
              if (word.startsWith('**')) return <strong key={idx}>{word.replace(/\*\*/g, '')} </strong>;
              return word + ' ';
            })}
        </div>

        {/* Images Grid */}
        {post.images.length > 0 && (
          <div className={`grid gap-1 mb-4 rounded-xl overflow-hidden ${
            post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' :
            post.images.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
          }`}>
             {post.images.slice(0, 4).map((img: string, idx: number) => (
               <div key={idx} className={`relative group overflow-hidden cursor-pointer ${post.images.length === 3 && idx === 0 ? 'row-span-2 h-full' : 'h-48'}`}>
                 <img src={img} alt="Post content" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                 {idx === 3 && post.images.length > 4 && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                     +{post.images.length - 4}
                   </div>
                 )}
               </div>
             ))}
          </div>
        )}

        {/* Engagement Stats - Removed Shares and Thumbs Up Icon */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-2">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
               <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center border-2 border-white"><Heart size={10} fill="white" stroke="none" /></div>
            </div>
            <span className="ml-1 hover:underline cursor-pointer">{post.likes}</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">{post.comments.length} bình luận</span>
          </div>
        </div>

        {/* Action Buttons - Removed Share Button, Like Icon is now Heart */}
        <div className="flex border-t border-gray-100 pt-1">
          <ActionButton
            active={post.isLiked}
            icon={<Heart size={18} fill={post.isLiked ? THEME.colors.error : 'none'} />}
            label="Thích"
            color={post.isLiked ? 'text-red-500' : 'text-gray-500'}
            onClick={onLike}
            className={post.isLiked ? 'animate-heart-pop' : ''}
          />
          <ActionButton icon={<MessageCircle size={18} />} label="Bình luận" onClick={onCommentClick} />
        </div>
      </div>

      {/* Short Comment Preview (1 comment) */}
      {post.comments.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-b-[16px] border-t border-gray-100">
           <div className="flex gap-2">
             <Avatar src={post.comments[0].avatar || `https://i.pravatar.cc/150?img=${post.comments[0].id}`} size="sm" />
             <div className="bg-white p-2 px-3 rounded-2xl rounded-tl-none shadow-sm text-sm">
                <span className="font-semibold block text-gray-900">{post.comments[0].author}</span>
                <span className="text-gray-700">{post.comments[0].content}</span>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon, label, color = 'text-gray-500', onClick, className = '', active }: { icon: React.ReactNode; label: string; color?: string; onClick: () => void; className?: string; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-all active:scale-95 ${color} ${className} ${active ? 'bg-red-50' : ''}`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function PostSkeleton() {
  return (
    <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
    </div>
  );
}

// --- Create Post Modal ---

function CreatePostModal({
  onClose,
  onSubmit,
  user,
  isSubmitting = false
}: {
  onClose: () => void;
  onSubmit: (content: string, images?: string[]) => void;
  user: User;
  isSubmitting?: boolean;
}) {
  const [content, setContent] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const handleSubmit = () => {
    if (!content.trim() || isSubmitting) return;
    onSubmit(content);
    setContent(''); // Clear after submit
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
      <div
        className={`bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">Tạo bài viết</h3>
          <button onClick={handleClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>

        <div className="p-4">
           <div className="flex items-center gap-3 mb-4">
              <Avatar src={user.avatar} />
              <div>
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-0.5">
                   <Users size={10} /> Public
                </div>
              </div>
           </div>

           <textarea
             className="w-full min-h-[150px] resize-none text-lg text-gray-700 placeholder-gray-400 focus:outline-none scrollbar-hide"
             placeholder="Bạn đang nghĩ gì thế?"
             value={content}
             onChange={(e) => setContent(e.target.value)}
             autoFocus
           />

           {/* Added Video button back next to Image button */}
           <div className="border border-gray-200 rounded-xl p-3 flex justify-between items-center mt-4 shadow-sm">
              <span className="text-sm font-medium text-gray-600 pl-2">Thêm vào bài viết</span>
              <div className="flex gap-1">
                 <button className="p-2 hover:bg-gray-100 rounded-full text-green-500"><ImageIcon size={20} /></button>
                 <button className="p-2 hover:bg-gray-100 rounded-full text-red-500"><Video size={20} /></button>
              </div>
           </div>
        </div>

        <div className="p-4 pt-0">
          <Button
            className="w-full py-3 text-lg"
            disabled={!content.trim()}
            onClick={handleSubmit}
          >
            Đăng bài
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Edit Post Modal ---

function EditPostModal({
  post,
  onClose,
  onSubmit,
  user,
  isSubmitting = false
}: {
  post: Post;
  onClose: () => void;
  onSubmit: (content: string, images?: string[]) => void;
  user: User;
  isSubmitting?: boolean;
}) {
  const [content, setContent] = useState(post.content);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const handleSubmit = () => {
    if (!content.trim() || isSubmitting) return;
    onSubmit(content, post.images);
    setContent(''); // Clear after submit
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity">
      <div
        className={`bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">Chỉnh sửa bài viết</h3>
          <button onClick={handleClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>

        <div className="p-4">
           <div className="flex items-center gap-3 mb-4">
              <Avatar src={user.avatar} />
              <div>
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-0.5">
                   <Users size={10} /> Public
                </div>
              </div>
           </div>

           <textarea
             className="w-full min-h-[150px] resize-none text-lg text-gray-700 placeholder-gray-400 focus:outline-none scrollbar-hide"
             placeholder="Bạn đang nghĩ gì thế?"
             value={content}
             onChange={(e) => setContent(e.target.value)}
             autoFocus
           />

           {/* Added Video button back next to Image button */}
           <div className="border border-gray-200 rounded-xl p-3 flex justify-between items-center mt-4 shadow-sm">
              <span className="text-sm font-medium text-gray-600 pl-2">Thỉnh sửa phương tiện</span>
              <div className="flex gap-1">
                 <button className="p-2 hover:bg-gray-100 rounded-full text-green-500"><ImageIcon size={20} /></button>
                 <button className="p-2 hover:bg-gray-100 rounded-full text-red-500"><Video size={20} /></button>
              </div>
           </div>
        </div>

        <div className="p-4 pt-0">
          <Button
            className="w-full py-3 text-lg"
            disabled={!content.trim() || content === post.content}
            onClick={handleSubmit}
          >
            Cập nhật
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Post Detail Modal (Full View) ---

function PostDetailModal({ 
  post, 
  onClose, 
  onLike,
  onAddComment,
  onDeleteComment,
  onUpdateComment,
  currentUserId,
  isEventManager = false
}: { 
  post: Post; 
  onClose: () => void; 
  onLike: () => void;
  onAddComment?: (content: string) => void;
  onDeleteComment?: (comment: Comment) => void;
  onUpdateComment?: (comment: Comment, newContent: string) => void;
  currentUserId: string;
  isEventManager?: boolean;
}) {
  const [commentContent, setCommentContent] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmitComment = () => {
    if (!commentContent.trim() || !onAddComment) return;
    onAddComment(commentContent);
    setCommentContent('');
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editingComment || !editContent.trim() || !onUpdateComment) return;
    onUpdateComment(editingComment, editContent);
    setEditingComment(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-8 animate-fade-in">
       <div className="bg-white w-full max-w-5xl h-full md:h-[90vh] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
         <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full md:hidden"><X size={20} /></button>

         {/* Left Side: Content & Media */}
         <div className="w-full md:w-[60%] bg-black flex flex-col items-center justify-center overflow-y-auto md:overflow-hidden relative">
            {post.images.length > 0 ? (
              <img src={post.images[0]} alt="Detail" className="max-w-full max-h-[50vh] md:max-h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 p-10 text-white text-center text-2xl font-medium">
                 {post.content}
              </div>
            )}
            {post.images.length > 1 && (
               <>
                 <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full text-white hover:bg-white/40"><ChevronDown className="rotate-90" /></button>
                 <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full text-white hover:bg-white/40"><ChevronDown className="-rotate-90" /></button>
               </>
            )}
         </div>

         {/* Right Side: Comments & Interaction */}
         <div className="w-full md:w-[40%] flex flex-col bg-white h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-start gap-3 flex-shrink-0">
               <Avatar src={post.author.avatar} />
               <div className="flex-1">
                 <div className="font-semibold text-gray-900">{post.author.name}</div>
                 <div className="text-xs text-gray-500">{post.time}</div>
               </div>
               <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full hidden md:block"><X size={20} /></button>
            </div>

            {/* Scrollable Comments Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {post.images.length > 0 && (
                <div className="text-sm text-gray-800 pb-4 border-b border-gray-100">
                   <span className="font-semibold">{post.author.name}</span> {post.content}
                </div>
              )}

              {post.comments.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">
                  <MessageCircle size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Chưa có bình luận nào.</p>
                </div>
              ) : (
                post.comments.map((comment: Comment) => (
                  <div key={comment.backendId || comment.id} className="flex gap-3 group">
                     <Avatar src={comment.avatar || `https://i.pravatar.cc/150?img=${comment.id}`} size="sm" />
                     <div className="flex-1">
                        {editingComment?.backendId === comment.backendId ? (
                          <div className="space-y-2">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-2">
                               <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-tl-none">
                                  <span className="font-semibold text-sm block">{comment.author}</span>
                                  <span className="text-sm text-gray-800">{comment.content}</span>
                               </div>
                            </div>
                            <div className="flex gap-4 mt-1 ml-2 text-xs text-gray-500 font-medium">
                               <button className="hover:text-gray-800">Thích</button>
                               {(comment.authorId === currentUserId || isEventManager) && (
                                 <>
                                   <button 
                                     onClick={() => handleStartEdit(comment)}
                                     className="hover:text-gray-800"
                                   >
                                     Sửa
                                   </button>
                                   {onDeleteComment && (
                                     <button 
                                       onClick={() => onDeleteComment(comment)}
                                       className="hover:text-red-600 text-red-500"
                                     >
                                       Xóa
                                     </button>
                                   )}
                                 </>
                               )}
                               <span>{comment.time}</span>
                            </div>
                          </>
                        )}
                     </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions - No Share */}
            <div className="border-t border-gray-100 p-3 bg-white flex-shrink-0">
               <div className="flex justify-between items-center mb-2 px-1">
                 <div className="flex gap-3 text-2xl">
                    <button onClick={onLike} className={`transition-transform active:scale-75 ${post.isLiked ? 'text-red-500' : 'text-gray-800'}`}>
                      <Heart fill={post.isLiked ? 'currentColor' : 'none'} size={24} />
                    </button>
                    <button className="text-gray-800 hover:text-gray-500"><MessageCircle size={24} /></button>
                 </div>
               </div>
               <div className="font-semibold text-sm mb-2 px-1">{post.likes} lượt thích</div>

               <div className="flex items-center gap-2">
                 <input
                   type="text"
                   placeholder="Thêm bình luận..."
                   className="flex-1 bg-transparent text-sm py-2 px-1 focus:outline-none"
                   value={commentContent}
                   onChange={(e) => setCommentContent(e.target.value)}
                   onKeyPress={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleSubmitComment();
                     }
                   }}
                 />
                 <button 
                   className="text-blue-500 font-semibold text-sm disabled:opacity-50 hover:text-blue-600" 
                   disabled={!commentContent.trim()}
                   onClick={handleSubmitComment}
                 >
                   Đăng
                 </button>
               </div>
            </div>
         </div>
       </div>
    </div>
  );
}