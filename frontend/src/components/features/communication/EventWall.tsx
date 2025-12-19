import React, { useState, useEffect } from 'react';
import { 
  Heart, MessageCircle, MoreVertical, MapPin, 
  Users, Calendar, Image as ImageIcon, X, 
  ChevronDown, Check, Bell, User, Pin,
  Edit3, Search, Shield, BadgeCheck, Mail
} from 'lucide-react';

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

const MOCK_USER = {
  id: 'me',
  name: 'Nguyễn Văn A',
  avatar: 'https://i.pravatar.cc/150?img=11',
  role: 'Volunteer'
};

const MOCK_MEMBERS = [
  { id: 1, name: 'Trần Quản Lý', role: 'Event Manager', avatar: 'https://i.pravatar.cc/150?img=33', email: 'manager@event.com', status: 'Online' },
  { id: 2, name: 'Lê Điều Phối', role: 'Volunteer', avatar: 'https://i.pravatar.cc/150?img=12', email: 'coor@event.com', status: 'Offline' },
  { id: 3, name: 'Nguyễn Văn A', role: 'Volunteer', avatar: 'https://i.pravatar.cc/150?img=11', email: 'nguyenvana@gmail.com', status: 'Online' },
  { id: 4, name: 'Phạm Minh Tú', role: 'Volunteer', avatar: 'https://i.pravatar.cc/150?img=5', email: 'tupm@gmail.com', status: 'Online' },
  { id: 5, name: 'Hoàng Văn C', role: 'Volunteer', avatar: 'https://i.pravatar.cc/150?img=8', email: 'hoangc@gmail.com', status: 'Offline' },
  { id: 6, name: 'Đỗ Thị D', role: 'Volunteer', avatar: 'https://i.pravatar.cc/150?img=9', email: 'dothi@gmail.com', status: 'Offline' },
  { id: 7, name: 'Vũ Văn E', role: 'Volunteer', avatar: 'https://i.pravatar.cc/150?img=60', email: 'vue@gmail.com', status: 'Online' },
];

const MOCK_POSTS = [
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
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800'
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

const Avatar = ({ src, size = 'md', className = '' }) => {
  const sizeClasses = {
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
      className={`${sizeClasses[size]} rounded-full ring-2 ring-[#5FC1D1] object-cover ${className}`}
    />
  );
};

const Badge = ({ text, color, className = '' }) => (
  <span 
    className={`px-2 py-0.5 rounded-full text-xs font-medium text-white flex items-center ${className}`}
    style={{ backgroundColor: color || THEME.colors.textGray }}
  >
    {text}
  </span>
);

const Button = ({ children, variant = 'primary', className = '', onClick, disabled }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
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

// --- Main Application Component ---

export default function EventWallApp() {
  const [activeTab, setActiveTab] = useState('wall');
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null); 
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleCreatePost = (content, images) => {
    const newPost = {
      id: Date.now(),
      type: 'regular',
      author: { ...MOCK_USER, roleColor: THEME.colors.primary },
      content: content,
      time: 'Vừa xong',
      likes: 0,
      comments: [],
      images: images || [],
      isLiked: false
    };
    setPosts([newPost, ...posts]);
    setIsCreateModalOpen(false);
    addNotification('success', 'Đã đăng bài viết thành công!');
  };

  const toggleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = !post.isLiked;
        if (isLiked) addNotification('like', `Bạn đã thích bài viết của ${post.author.name}`);
        return {
          ...post,
          isLiked,
          likes: isLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
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
              <Avatar src={MOCK_USER.avatar} size="sm" />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-gray-800 leading-none">{MOCK_USER.name}</div>
                <div className="text-[10px] font-medium text-blue-600 leading-tight mt-1">{MOCK_USER.role}</div>
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
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Event Cover" 
            />
            <div 
              className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8"
              style={{ background: `linear-gradient(to top, ${THEME.colors.primaryDeep} 90%, transparent)` }}
            >
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white w-fit mb-2 border border-white/30">
                Sự kiện thường niên
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 drop-shadow-md">Year End Party 2024</h2>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm sm:text-base">
                <div className="flex items-center gap-1.5"><Calendar size={16} /> 25/12/2024</div>
                <div className="flex items-center gap-1.5"><MapPin size={16} /> Riverside Center, Hanoi</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* --- Left Sidebar (Always Visible on Desktop) --- */}
          <aside className="hidden lg:block w-1/4 space-y-6">
            <SidebarCard title="Thông Tin Sự Kiện">
              <div className="space-y-4">
                <InfoRow icon={<Calendar size={18} />} label="Thời gian" value="08:00 - 17:00" />
                <InfoRow icon={<MapPin size={18} />} label="Địa điểm" value="Hội trường A2" />
                <InfoRow icon={<Users size={18} />} label="Tham gia" value="150/200 người" />
                
                {/* Updated Button: 'Đã tham gia' implies approved */}
                <Button variant="success" className="w-full mt-2 text-sm justify-center">
                  <Check size={16} /> Đã tham gia
                </Button>
              </div>
            </SidebarCard>

            <SidebarCard title="Thống Kê Nhanh">
              <div className="grid grid-cols-2 gap-4">
                <StatBox label="Bài viết" value={posts.length} />
                <StatBox label="Thành viên" value="67" />
                <StatBox label="Lượt thích" value="342" />
                <StatBox label="Bình luận" value="128" />
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
                    </div>
                  </div>
                </div>

                {/* Posts List */}
                {isLoading ? (
                  <div className="space-y-4">
                    <PostSkeleton />
                    <PostSkeleton />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map(post => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        onLike={() => toggleLike(post.id)}
                        onCommentClick={() => setSelectedPost(post)}
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
              <MembersList members={MOCK_MEMBERS} />
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
      {isCreateModalOpen && <CreatePostModal onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreatePost} user={MOCK_USER} />}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onLike={() => toggleLike(selectedPost.id)} />}

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

function MembersList({ members }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const managers = members.filter(m => m.role === 'Event Manager');
  const volunteers = members.filter(m => m.role !== 'Event Manager');

  const filteredManagers = managers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredVolunteers = volunteers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
             {filteredManagers.map(member => (
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
                filteredVolunteers.map(member => (
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

function MemberRow({ member, isManager }) {
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

function SidebarCard({ title, children }) {
  return (
    <div className="bg-white rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider border-b border-gray-100 pb-2">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
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

function StatBox({ label, value }) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg text-center">
      <div className="font-bold text-xl" style={{ color: THEME.colors.primaryDark }}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function ActionIcon({ label, icon }) {
  return (
    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 text-sm transition-colors">
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function NavIcon({ icon, active, onClick }) {
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

function PostCard({ post, onLike, onCommentClick }) {
  const isPinned = post.type === 'pinned';
  
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
          <button className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><MoreVertical size={20} /></button>
        </div>

        {/* Post Content */}
        <div className="text-gray-800 text-[15px] leading-relaxed mb-4 whitespace-pre-line">
            {post.content.split(' ').map((word, idx) => {
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
             {post.images.slice(0, 4).map((img, idx) => (
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
             <Avatar src={post.comments[0].authorAvatar || `https://i.pravatar.cc/150?img=${post.comments[0].id}`} size="sm" />
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

function ActionButton({ icon, label, color = 'text-gray-500', onClick, className = '', active }) {
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

function CreatePostModal({ onClose, onSubmit, user }) {
  const [content, setContent] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content);
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

           {/* Removed Tag, Smile, Location buttons. Only Image remains */}
           <div className="border border-gray-200 rounded-xl p-3 flex justify-between items-center mt-4 shadow-sm">
              <span className="text-sm font-medium text-gray-600 pl-2">Thêm vào bài viết</span>
              <div className="flex gap-1">
                 <button className="p-2 hover:bg-gray-100 rounded-full text-green-500"><ImageIcon size={20} /></button>
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

// --- Post Detail Modal (Full View) ---

function PostDetailModal({ post, onClose, onLike }) {
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
                post.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3 group">
                     <Avatar src={comment.avatar || `https://i.pravatar.cc/150?img=${comment.id}`} size="sm" />
                     <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                           <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-tl-none">
                              <span className="font-semibold text-sm block">{comment.author}</span>
                              <span className="text-sm text-gray-800">{comment.content}</span>
                           </div>
                        </div>
                        <div className="flex gap-4 mt-1 ml-2 text-xs text-gray-500 font-medium">
                           <button className="hover:text-gray-800">Thích</button>
                           <button className="hover:text-gray-800">Phản hồi</button>
                           <span>{comment.time}</span>
                        </div>
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
                 />
                 <button className="text-blue-500 font-semibold text-sm disabled:opacity-50" disabled>Đăng</button>
               </div>
            </div>
         </div>
       </div>
    </div>
  );
}