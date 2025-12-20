import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, LayoutDashboard, Calendar, Search, MessageSquare,
  LogOut, Clock, MapPin, ChevronRight,
  Award, Star, User, Edit, Camera, Mail, Phone, Save, X,
  CheckCircle, Hourglass, ThumbsUp
} from 'lucide-react';
import { NotificationDropdown } from '../notification/NotificationDropdown';


/* --- UTILS HOOK (Dành cho Dashboard) --- */
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return { count, countRef };
};

interface UserProfile {
  fullName: string;
  role: string;
  email: string;
  phoneNumber: string;
  address: string;
  bio: string;
  avatar: string;
  dateOfBirth: string;
  username: string;
}

const VolunteerDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const navigate = useNavigate();
  // State quản lý Tab hiển thị
  const [activeTab, setActiveTab] = useState("overview");

  // State quản lý Hồ sơ
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);

  // Dashboard API state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: "Nguyễn Thu Hà",
    role: "Tình nguyện viên",
    email: "thuha.nguyen@volunteerhub.vn",
    phoneNumber: "0912 345 678",
    address: "Cầu Giấy, Hà Nội",
    bio: "Yêu thích các hoạt động bảo vệ môi trường và giáo dục trẻ em. Tôi tin rằng những hành động nhỏ có thể tạo nên thay đổi lớn.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    dateOfBirth: "1995-05-15",
    username: "thuha.nguyen"
  });

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError(null);
        const data = await getVolunteerDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardError(error instanceof Error ? error.message : 'Failed to load dashboard');
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Xử lý thay đổi input trong form sửa profile
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setUpdateMessage(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUpdateMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setIsLoading(false);
      return;
    }

    try {
      const updateData = {
        username: userProfile.username,
        fullName: userProfile.fullName,
        phoneNumber: userProfile.phoneNumber,
        address: userProfile.address,
        bio: userProfile.bio,
        dateOfBirth: userProfile.dateOfBirth,
        avatar: userProfile.avatar
      };

      const response = await fetch("http://localhost:8000/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUpdateMessage("Cập nhật hồ sơ thành công! 🎉");
        setIsEditing(false);
      } else {
        setUpdateMessage(`Lỗi: ${result.message || "Không thể cập nhật hồ sơ"}`);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setUpdateMessage("Lỗi kết nối. Vui lòng thử lại.");
      // Revert to original profile on error
      if (originalProfile) {
        setUserProfile(originalProfile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Menu Items
  const navItems = [
    { id: "overview", icon: <LayoutDashboard size={20} />, label: "Tổng quan" },
    { id: "calendar", icon: <Calendar size={20} />, label: "Lịch của tôi" },
    { id: "search", icon: <Search size={20} />, label: "Tìm sự kiện" },
    { id: "feedback", icon: <MessageSquare size={20} />, label: "Phản hồi" },
    { id: "profile", icon: <User size={20} />, label: "Hồ sơ" },
  ];

  // MyCalendar Component
  const MyCalendar = () => {
    // State quản lý bộ lọc: 'upcoming' | 'pending' | 'completed'
    const [filter, setFilter] = useState("upcoming");
    const [myEvents, setMyEvents] = useState<any[]>([]);
    const [calendarLoading, setCalendarLoading] = useState(true);

    // Fetch user's events on component mount
    useEffect(() => {
      const fetchMyEvents = async () => {
        try {
          setCalendarLoading(true);
          // For now, we'll use mock data as the calendar API might not be fully implemented
          // In a real implementation, this would call an API to get user's events by status
          const mockEvents = [
            {
              id: 1,
              title: "Chiến dịch Xanh: Làm sạch bãi biển Đà Nẵng",
              date: "20/12/2024",
              time: "07:00 - 11:00",
              location: "Bãi biển Mỹ Khê, Đà Nẵng",
              status: "upcoming",
              image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            },
            {
              id: 2,
              title: "Dạy tiếng Anh cho trẻ em vùng cao",
              date: "15/01/2025",
              time: "08:00 - 17:00",
              location: "Mộc Châu, Sơn La",
              status: "pending",
              image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            },
            {
              id: 3,
              title: "Hiến máu nhân đạo: Giọt hồng yêu thương",
              date: "10/11/2024",
              time: "08:00 - 11:30",
              location: "Viện Huyết học, Hà Nội",
              status: "completed",
              hours: 4,
              rating: 5,
              image: "https://images.unsplash.com/photo-1584515933487-779824d29309?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            }
          ];
          setMyEvents(mockEvents);
        } catch (error) {
          console.error('Error fetching my events:', error);
          setMyEvents([]);
        } finally {
          setCalendarLoading(false);
        }
      };

      fetchMyEvents();
    }, []);

    // Lọc sự kiện theo tab hiện tại
    const filteredEvents = myEvents.filter(evt => evt.status === filter);

    // Helper: Hiển thị Badge trạng thái
    const renderStatusBadge = (status: string) => {
      switch(status) {
        case 'upcoming':
          return (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
              <Clock size={12}/> Sắp diễn ra
            </span>
          );
        case 'pending':
          return (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
              <Hourglass size={12}/> Chờ duyệt
            </span>
          );
        case 'completed':
          return (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
              <CheckCircle size={12}/> Hoàn thành
            </span>
          );
        default: return null;
      }
    };

    return (
      <div className="w-full bg-[#F8F9FA] min-h-screen p-6 font-sans text-[#2C3E50]">
        {/* CSS Animation nội bộ cho component này */}
        <style>{`
          .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#2C3E50]">Lịch hoạt động của tôi</h2>
              <p className="text-gray-500 text-sm mt-1">Theo dõi hành trình và các sự kiện bạn đã đăng ký</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm self-start md:self-auto">
              {[
                { id: 'upcoming', label: 'Sắp tới' },
                { id: 'pending', label: 'Chờ duyệt' },
                { id: 'completed', label: 'Lịch sử' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    filter === tab.id
                      ? 'bg-[#34729C] text-white shadow-md transform scale-105'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#34729C]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Events List Container */}
          <div className="space-y-5">
            {calendarLoading ? (
              // Loading state for events
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                  <div className="animate-pulse flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-56 h-48 md:h-32 bg-gray-200 rounded-2xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="flex gap-3 mt-4">
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row gap-6 items-start group"
                >
                  {/* Image Area */}
                  <div className="w-full md:w-56 h-48 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden relative">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      {renderStatusBadge(evt.status)}
                    </div>
                    {/* Overlay gradient for text readability if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden"></div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-[#2C3E50] mb-3 leading-tight group-hover:text-[#34729C] transition-colors">
                        {evt.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Calendar size={16} className="text-[#34729C]" />
                        <span className="font-medium">{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Clock size={16} className="text-[#34729C]" />
                        <span className="font-medium">{evt.time}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <MapPin size={16} className="text-[#34729C]" />
                        <span className="font-medium line-clamp-1">{evt.location}</span>
                      </div>
                    </div>

                    {/* Completed Stats */}
                    {evt.status === 'completed' && (
                      <div className="flex items-center gap-4 text-xs font-bold bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-100 w-fit">
                        <span>Đã đóng góp: {evt.hours}h</span>
                        <span className="text-green-300">|</span>
                        <span className="flex items-center gap-1">
                          Đánh giá: {evt.rating}/5 <Star size={12} fill="currentColor" className="text-green-600"/>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-2 md:mt-0 justify-center">
                    <button className="flex-1 md:flex-none px-6 py-3 bg-[#F0F7FF] text-[#34729C] font-bold rounded-xl hover:bg-[#34729C] hover:text-white transition-all text-sm whitespace-nowrap shadow-sm hover:shadow-md">
                      Xem chi tiết
                    </button>
                    {evt.status === 'upcoming' && (
                      <button className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-[#34729C] to-[#5FC1D1] text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all text-sm whitespace-nowrap shadow-md">
                        Check-in
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <Calendar size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-400 mb-1">Chưa có sự kiện nào</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                  Hiện tại bạn chưa có sự kiện nào trong danh mục <span className="text-[#34729C] font-bold">"{filter === 'upcoming' ? 'Sắp tới' : filter === 'pending' ? 'Chờ duyệt' : 'Lịch sử'}"</span>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // FeedbackSection Component
  const FeedbackSection = () => {
    // State quản lý Feedback Tab: 'received' (Đánh giá về tôi) | 'given' (Đánh giá của tôi)
    const [feedbackTab, setFeedbackTab] = useState("received");
    const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    // Fetch feedback data when tab changes
    useEffect(() => {
      const fetchFeedback = async () => {
        try {
          setFeedbackLoading(true);
          const data = await getFeedback(feedbackTab as 'received' | 'given');
          setFeedbackData(data);
        } catch (error) {
          console.error('Error fetching feedback:', error);
          setFeedbackData([]);
        } finally {
          setFeedbackLoading(false);
        }
      };

      fetchFeedback();
    }, [feedbackTab]);

    // Helper render star rating
    const renderStars = (rating: number) => {
      return (
        <div className="flex text-[#FFD93D]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} className={i < rating ? "" : "text-gray-300"} />
          ))}
        </div>
      );
    };

    return (
      <div className="w-full bg-[#F8F9FA] min-h-screen p-6 font-sans text-[#2C3E50]">
        {/* Animation nội bộ */}
        <style>{`
          .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#2C3E50]">Phản hồi & Đánh giá</h2>
              <p className="text-gray-500 text-sm mt-1">Xem lại những gì người khác nói về bạn và đánh giá của bạn</p>
            </div>

            {/* Feedback Sub-tabs */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-gray-100 shadow-sm self-start md:self-auto">
              {[
                { id: 'received', label: 'Đánh giá về tôi', icon: <User size={16} /> },
                { id: 'given', label: 'Đánh giá của tôi', icon: <ThumbsUp size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFeedbackTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    feedbackTab === tab.id
                      ? 'bg-[#34729C] text-white shadow-md'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#34729C]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbackLoading ? (
              // Loading state
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : feedbackData.length > 0 ? (
              feedbackData.map((fb: FeedbackItem) => (
                <div key={fb.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1 group">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={fb.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80"} alt={fb.organizer || "Organizer"} className="w-12 h-12 rounded-full border border-gray-100 object-cover" />
                    <div>
                      <h4 className="font-bold text-[#2C3E50] text-lg">{fb.organizer || "Ban tổ chức"}</h4>
                      <p className="text-xs text-gray-500">Ban tổ chức</p>
                    </div>
                    <div className="ml-auto text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg font-medium">{fb.date}</div>
                  </div>

                  <div className="mb-3">
                    {renderStars(fb.rating)}
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4 italic bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                    "{fb.comment}"
                  </p>

                  <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-xs font-bold text-[#34729C] bg-[#F0F7FF] p-2 rounded-lg mt-auto">
                    <Award size={14} /> Sự kiện: {fb.eventName}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-600 mb-2">Chưa có đánh giá nào</h4>
                <p className="text-gray-500">Bạn chưa nhận được đánh giá nào từ ban tổ chức.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans text-[#2C3E50]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex-shrink-0 sticky top-0 md:h-screen z-40">
        <div className="p-6 flex items-center gap-2 border-b border-gray-50 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-gradient-to-tr from-[#34729C] to-[#5FC1D1] rounded-lg flex items-center justify-center text-white">
            <Heart fill="white" size={16} />
          </div>
          <span className="text-xl font-bold text-[#34729C]">VolunteerHub</span>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.id === 'search' ? navigate('/events') : setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-[#34729C]/10 text-[#34729C]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-gray-50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 w-full max-w-md bg-gray-100 px-4 py-2 rounded-full">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Tìm kiếm nhanh..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
          <div className="flex items-center gap-4">
            <NotificationDropdown userId={localStorage.getItem('userId') || 'mock-user-id'} />
            <div
              className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer"
              onClick={() => setActiveTab("profile")}
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-[#2C3E50]">{userProfile.fullName}</p>
                <p className="text-xs text-gray-500">Tình nguyện viên</p>
              </div>
              <img src={userProfile.avatar} alt="Avatar" className="w-10 h-10 rounded-full ring-2 ring-[#5FC1D1] object-cover" />
            </div>
          </div>
        </header>

        {/* Content Area Switcher */}
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
          
          {/* VIEW: OVERVIEW (DASHBOARD) */}
          {activeTab === "overview" && (
            <>
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-[#34729C] to-[#5FC1D1] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg animate-fade-in-up">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Chào buổi sáng, {userProfile.fullName.split(' ').pop()}! 👋</h1>
                      <p className="text-white/90">Bạn đã sẵn sàng cho sự kiện "Dọn rác bãi biển" vào cuối tuần này chưa?</p>
                    </div>
                    <button className="px-6 py-3 bg-white text-[#34729C] font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                      Xem chi tiết
                    </button>
                 </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dashboardLoading ? (
                  // Loading state for stats
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-2xl animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : dashboardData ? (
                  [
                    {
                      label: "Giờ đóng góp",
                      value: `${dashboardData.userStats.totalHoursContributed}h`,
                      icon: <Clock size={24} className="text-[#34729C]" />,
                      color: "bg-[#D1ECFF]"
                    },
                    {
                      label: "Sự kiện tham gia",
                      value: dashboardData.userStats.totalEventsParticipated.toString(),
                      icon: <Calendar size={24} className="text-[#5FC1D1]" />,
                      color: "bg-[#E0F7FA]"
                    },
                    {
                      label: "Rating",
                      value: `${dashboardData.userStats.averageRating.toFixed(1)}/5`,
                      icon: <Star size={24} className="text-[#FFD93D]" />,
                      color: "bg-[#FFF8E1]"
                    }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-[#2C3E50]">{stat.value}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  // Error state
                  <div className="col-span-3 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <p className="text-red-600">Không thể tải thống kê. Vui lòng thử lại.</p>
                  </div>
                )}
              </div>

              {/* Main Content (Events) */}
              <div className="w-full space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#2C3E50]">Sự kiện sắp tới</h3>
                    <a href="#" className="text-[#34729C] text-sm font-semibold hover:underline">Xem lịch</a>
                 </div>
                  
                 {/* Upcoming Events */}
                 {dashboardLoading ? (
                   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                     <div className="animate-pulse">
                       <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                       <div className="h-32 bg-gray-200 rounded-xl"></div>
                     </div>
                   </div>
                 ) : dashboardData && dashboardData.upcomingEvents.length > 0 ? (
                   dashboardData.upcomingEvents.slice(0, 1).map((event: any) => (
                     <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all">
                         <div className="absolute top-0 left-0 w-1.5 h-full bg-[#34729C]"></div>
                         <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3">
                               <img src={event.image} alt={event.title} className="w-full h-32 object-cover rounded-xl" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                               <div>
                                  <div className="flex items-center gap-2 mb-2">
                                     <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-bold rounded uppercase">Sắp diễn ra</span>
                                     <span className="text-sm text-gray-500">{event.date} • {event.time}</span>
                                  </div>
                                  <h4 className="text-lg font-bold text-[#2C3E50] mb-2">{event.title}</h4>
                                  <p className="text-gray-500 text-sm flex items-center gap-1"><MapPin size={14} /> {event.location}</p>
                               </div>
                               <div className="mt-4 flex gap-3">
                                  <button className="flex-1 px-4 py-2 bg-[#34729C] text-white text-sm font-bold rounded-lg hover:bg-[#2a5d80] transition-colors">Check-in</button>
                                  <button
                                    onClick={() => navigate(`/event/${event.id}`)}
                                    className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    Chi tiết
                                  </button>
                               </div>
                            </div>
                         </div>
                     </div>
                   ))
                 ) : (
                   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                     <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                     <h4 className="text-lg font-bold text-gray-600 mb-2">Chưa có sự kiện sắp tới</h4>
                     <p className="text-gray-500 text-sm">Hãy khám phá và đăng ký tham gia các sự kiện ý nghĩa!</p>
                     <button
                       onClick={() => navigate('/events')}
                       className="mt-4 px-6 py-2 bg-[#34729C] text-white text-sm font-bold rounded-lg hover:bg-[#2a5d80] transition-colors"
                     >
                       Tìm sự kiện
                     </button>
                   </div>
                 )}

                 {/* Recommended Section */}
                 <div className="pt-4">
                     <h3 className="text-xl font-bold text-[#2C3E50] mb-4">Gợi ý cho bạn</h3>
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { title: "Dạy trẻ em vùng cao", loc: "Sơn La", img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
                          { title: "Trồng cây gây rừng", loc: "Ba Vì", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
                          { title: "Phát cháo từ thiện", loc: "Hà Nội", img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" }
                        ].map((evt, i) => (
                          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1">
                             <img src={evt.img} alt="Thumb" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                             <div>
                                <h5 className="font-bold text-[#2C3E50] mb-1 line-clamp-2 leading-tight">{evt.title}</h5>
                                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin size={12} /> {evt.loc}</p>
                                <span className="text-[#34729C] text-xs font-bold flex items-center gap-1">Xem ngay <ChevronRight size={12} /></span>
                             </div>
                          </div>
                        ))}
                     </div>
                 </div>
              </div>
            </>
          )}

          {/* VIEW: PROFILE (NEW) */}
          {activeTab === "profile" && (
            <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in-up">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Profile Cover */}
                <div className="h-40 bg-gradient-to-r from-[#34729C] to-[#5FC1D1] relative">
                   <div className="absolute inset-0 bg-white/10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                </div>
                
                <div className="px-8 pb-8">
                  {/* Avatar & Header */}
                  <div className="relative flex flex-col md:flex-row justify-between items-end -mt-16 mb-8 gap-4">
                    <div className="relative group">
                       <img 
                          src={userProfile.avatar} 
                          alt="Profile" 
                          className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white" 
                        />
                       {isEditing && (
                         <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-[#34729C] hover:bg-gray-50 border border-gray-100">
                           <Camera size={18} />
                         </button>
                       )}
                    </div>
                    
                    <div className="flex-1 mb-2 md:mb-0">
                      <h2 className="text-2xl font-bold text-[#2C3E50]">{userProfile.fullName}</h2>
                      <p className="text-gray-500">{userProfile.role}</p>
                    </div>

                    <div className="flex gap-3 mb-2 md:mb-0">
                      {!isEditing ? (
                        <button
                          onClick={() => {
                            setOriginalProfile({ ...userProfile });
                            setIsEditing(true);
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#34729C] text-white rounded-xl font-bold shadow-md hover:bg-[#2a5d80] transition-colors"
                        >
                          <Edit size={16} /> Chỉnh sửa
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              if (originalProfile) {
                                setUserProfile(originalProfile);
                              }
                              setIsEditing(false);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                          >
                            <X size={16} /> Hủy
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#5FC1D1] text-white rounded-xl font-bold shadow-md hover:bg-[#4db1c0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang lưu...
                              </>
                            ) : (
                              <>
                                <Save size={16} /> Lưu
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Profile Form / Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Column: Personal Info */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-[#2C3E50] border-b border-gray-100 pb-2">Thông tin cá nhân</h3>
                      
                      <div className="space-y-4">
                        <div className="group">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Họ và tên</label>
                          {isEditing ? (
                            <input type="text" name="fullName" value={userProfile.fullName} onChange={handleProfileChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#34729C] focus:ring-2 focus:ring-[#34729C]/10 outline-none transition-all bg-gray-50 focus:bg-white" />
                          ) : (
                            <p className="text-[#2C3E50] font-medium text-lg">{userProfile.fullName}</p>
                          )}
                        </div>

                        <div className="group">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                          {isEditing ? (
                            <input type="email" name="email" value={userProfile.email} onChange={handleProfileChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#34729C] focus:ring-2 focus:ring-[#34729C]/10 outline-none transition-all bg-gray-50 focus:bg-white" />
                          ) : (
                            <div className="flex items-center gap-2 text-[#2C3E50] font-medium">
                              <Mail size={18} className="text-[#5FC1D1]" /> {userProfile.email}
                            </div>
                          )}
                        </div>

                        <div className="group">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Số điện thoại</label>
                          {isEditing ? (
                            <input type="tel" name="phoneNumber" value={userProfile.phoneNumber} onChange={handleProfileChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#34729C] focus:ring-2 focus:ring-[#34729C]/10 outline-none transition-all bg-gray-50 focus:bg-white" />
                          ) : (
                            <div className="flex items-center gap-2 text-[#2C3E50] font-medium">
                              <Phone size={18} className="text-[#5FC1D1]" /> {userProfile.phoneNumber}
                            </div>
                          )}
                        </div>

                        <div className="group">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Địa chỉ</label>
                          {isEditing ? (
                            <input type="text" name="address" value={userProfile.address} onChange={handleProfileChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#34729C] focus:ring-2 focus:ring-[#34729C]/10 outline-none transition-all bg-gray-50 focus:bg-white" />
                          ) : (
                            <div className="flex items-center gap-2 text-[#2C3E50] font-medium">
                              <MapPin size={18} className="text-[#5FC1D1]" /> {userProfile.address}
                            </div>
                          )}
                        </div>

                        <div className="group">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ngày sinh</label>
                          {isEditing ? (
                            <input type="date" name="dateOfBirth" value={userProfile.dateOfBirth} onChange={handleProfileChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#34729C] focus:ring-2 focus:ring-[#34729C]/10 outline-none transition-all bg-gray-50 focus:bg-white" />
                          ) : (
                            <p className="text-[#2C3E50] font-medium">{userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Bio & Skills */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[#2C3E50] border-b border-gray-100 pb-2">Giới thiệu</h3>
                        {isEditing ? (
                          <textarea name="bio" rows={4} value={userProfile.bio} onChange={handleProfileChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#34729C] focus:ring-2 focus:ring-[#34729C]/10 outline-none transition-all bg-gray-50 focus:bg-white resize-none" />
                        ) : (
                          <p className="text-gray-600 leading-relaxed italic">"{userProfile.bio}"</p>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Update Message */}
                  {updateMessage && (
                    <div className={`p-4 rounded-xl border text-center ${
                      updateMessage.includes("thành công")
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}>
                      {updateMessage}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* VIEW: CALENDAR */}
          {activeTab === "calendar" && <MyCalendar />}

          {/* VIEW: FEEDBACK */}
          {activeTab === "feedback" && <FeedbackSection />}

          {/* Placeholder for other tabs */}
          {(activeTab !== "overview" && activeTab !== "profile" && activeTab !== "calendar" && activeTab !== "feedback") && (
             <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                   <Clock size={48} className="text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-[#2C3E50] mb-2">Tính năng đang phát triển</h3>
                <p className="text-gray-500">Vui lòng quay lại sau nhé!</p>
                <button
                  onClick={() => setActiveTab("overview")}
                  className="mt-6 text-[#34729C] font-bold hover:underline"
                >
                  Quay về Tổng quan
                </button>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default VolunteerDashboard;