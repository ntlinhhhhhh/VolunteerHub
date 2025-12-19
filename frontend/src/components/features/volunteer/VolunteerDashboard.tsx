import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, LayoutDashboard, Calendar, Search, MessageSquare,
  LogOut, Bell, Clock, Trophy, MapPin, ChevronRight,
  Award, Star, User, Edit, Camera, Mail, Phone, Save, X,
  CheckCircle, Hourglass, AlertCircle
} from 'lucide-react';

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
  name: string;
  role: string;
  email: string;
  phone: string;
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
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Nguyễn Thu Hà",
    role: "Tình nguyện viên",
    email: "thuha.nguyen@volunteerhub.vn",
    phone: "0912 345 678",
    address: "Cầu Giấy, Hà Nội",
    bio: "Yêu thích các hoạt động bảo vệ môi trường và giáo dục trẻ em. Tôi tin rằng những hành động nhỏ có thể tạo nên thay đổi lớn.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    dateOfBirth: "1995-05-15",
    username: "thuha.nguyen"
  });

  // For demo purposes, we use mock data to show the interface
  useEffect(() => {
    console.log("Demo mode: Using mock user data to display interface");
    // Mock data is already set in initial state, no API call needed for demo
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
        fullName: userProfile.name,
        phoneNumber: userProfile.phone,
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
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div 
              className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer"
              onClick={() => setActiveTab("profile")}
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-[#2C3E50]">{userProfile.name}</p>
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
                      <h1 className="text-3xl font-bold mb-2">Chào buổi sáng, {userProfile.name.split(' ').pop()}! 👋</h1>
                      <p className="text-white/90">Bạn đã sẵn sàng cho sự kiện "Dọn rác bãi biển" vào cuối tuần này chưa?</p>
                    </div>
                    <button className="px-6 py-3 bg-white text-[#34729C] font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                      Xem chi tiết
                    </button>
                 </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Giờ đóng góp", value: "48h", icon: <Clock size={24} className="text-[#34729C]" />, color: "bg-[#D1ECFF]" },
                  { label: "Sự kiện tham gia", value: "12", icon: <Calendar size={24} className="text-[#5FC1D1]" />, color: "bg-[#E0F7FA]" },
                  { label: "Rating", value: "4.9/5", icon: <Star size={24} className="text-[#FFD93D]" />, color: "bg-[#FFF8E1]" }
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
                ))}
              </div>

              {/* Main Content (Events) */}
              <div className="w-full space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#2C3E50]">Sự kiện sắp tới</h3>
                    <a href="#" className="text-[#34729C] text-sm font-semibold hover:underline">Xem lịch</a>
                 </div>
                  
                 {/* Timeline Card */}
                 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all">
                     <div className="absolute top-0 left-0 w-1.5 h-full bg-[#34729C]"></div>
                     <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                           <img src="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Event" className="w-full h-32 object-cover rounded-xl" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                           <div>
                              <div className="flex items-center gap-2 mb-2">
                                 <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-bold rounded uppercase">Sắp diễn ra</span>
                                 <span className="text-sm text-gray-500">20/12/2024 • 07:00 AM</span>
                              </div>
                              <h4 className="text-lg font-bold text-[#2C3E50] mb-2">Chiến dịch Xanh: Làm sạch bãi biển Đà Nẵng</h4>
                              <p className="text-gray-500 text-sm flex items-center gap-1"><MapPin size={14} /> Bãi biển Mỹ Khê, Đà Nẵng</p>
                           </div>
                           <div className="mt-4 flex gap-3">
                              <button className="flex-1 px-4 py-2 bg-[#34729C] text-white text-sm font-bold rounded-lg hover:bg-[#2a5d80] transition-colors">Check-in</button>
                              <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">Chi tiết</button>
                           </div>
                        </div>
                     </div>
                 </div>

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
                      <h2 className="text-2xl font-bold text-[#2C3E50]">{userProfile.name}</h2>
                      <p className="text-gray-500">{userProfile.role}</p>
                    </div>

                    <div className="flex gap-3 mb-2 md:mb-0">
                      {!isEditing ? (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#34729C] text-white rounded-xl font-bold shadow-md hover:bg-[#2a5d80] transition-colors"
                        >
                          <Edit size={16} /> Chỉnh sửa
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => setIsEditing(false)}
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
                            <input type="text" name="name" value={userProfile.name} onChange={handleProfileChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#34729C] focus:ring-2 focus:ring-[#34729C]/10 outline-none transition-all bg-gray-50 focus:bg-white" />
                          ) : (
                            <p className="text-[#2C3E50] font-medium text-lg">{userProfile.name}</p>
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
                            <input type="tel" name="phone" value={userProfile.phone} onChange={handleProfileChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#34729C] focus:ring-2 focus:ring-[#34729C]/10 outline-none transition-all bg-gray-50 focus:bg-white" />
                          ) : (
                            <div className="flex items-center gap-2 text-[#2C3E50] font-medium">
                              <Phone size={18} className="text-[#5FC1D1]" /> {userProfile.phone}
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
          
          {/* Placeholder for other tabs */}
          {(activeTab !== "overview" && activeTab !== "profile") && (
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