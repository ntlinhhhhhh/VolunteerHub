import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Filter, ArrowRight, Heart,
  SlidersHorizontal, X, ChevronDown, Users, Clock, ArrowDownUp, Sparkles, Check,
  Bell, Menu
} from 'lucide-react';
import { Reveal } from '../../hooks/Reveal';

/* --- MOCK DATA --- */
const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: '🌟' },
  { id: 'env', name: 'Môi trường', color: '#6BCB77', icon: '🌳' },
  { id: 'edu', name: 'Giáo dục', color: '#5FC1D1', icon: '📚' },
  { id: 'health', name: 'Y tế', color: '#FF6B6B', icon: '⚕️' },
  { id: 'elder', name: 'Người cao tuổi', color: '#FFD93D', icon: '👵' },
  { id: 'community', name: 'Cộng đồng', color: '#34729C', icon: '🤝' },
];

const EVENTS_DATA = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Môi trường",
    color: "#6BCB77",
    title: "Chiến dịch Xanh: Làm sạch bãi biển Đà Nẵng",
    date: "20/12/2024",
    location: "Bãi biển Mỹ Khê, Đà Nẵng",
    joined: 45,
    total: 50,
    org: "Green Earth VN",
    createdAt: "2024-12-01T08:00:00Z"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Giáo dục",
    color: "#5FC1D1",
    title: "Dạy tiếng Anh cho trẻ em vùng cao",
    date: "15/01/2025",
    location: "Mộc Châu, Sơn La",
    joined: 12,
    total: 20,
    org: "Teach for VN",
    createdAt: "2024-12-05T09:30:00Z"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Y tế",
    color: "#FF6B6B",
    title: "Hiến máu nhân đạo: Giọt hồng yêu thương",
    date: "05/01/2025",
    location: "Viện Huyết học, Hà Nội",
    joined: 150,
    total: 200,
    org: "Hội Chữ Thập Đỏ",
    createdAt: "2024-11-20T14:00:00Z"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Môi trường",
    color: "#6BCB77",
    title: "Trồng 1000 cây xanh tại Ba Vì",
    date: "10/02/2025",
    location: "Vườn QG Ba Vì, Hà Nội",
    joined: 80,
    total: 100,
    org: "Green Life",
    createdAt: "2024-12-10T10:15:00Z"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Cộng đồng",
    color: "#34729C",
    title: "Phát cháo miễn phí cho bệnh nhân",
    date: "Hàng tuần",
    location: "Bệnh viện K, Hà Nội",
    joined: 5,
    total: 10,
    org: "Nhóm Thiện Tâm",
    createdAt: "2024-10-15T06:45:00Z"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Người cao tuổi",
    color: "#FFD93D",
    title: "Thăm và tặng quà viện dưỡng lão",
    date: "25/12/2024",
    location: "Viện dưỡng lão Thiên Đức",
    joined: 15,
    total: 30,
    org: "Tuổi Trẻ Thủ Đô",
    createdAt: "2024-12-08T16:20:00Z"
  }
];

// Nhận prop onTagClick để xử lý click vào tag và onCardClick để xử lý click vào card
const EventCard = ({ event, onTagClick, onCardClick }: { event: typeof EVENTS_DATA[0], onTagClick: (category: string) => void, onCardClick: (eventId: number) => void }) => {
  const percent = (event.joined / event.total) * 100;

  return (
    <div className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#34729C]/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full relative">
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-transparent transition-colors z-10"></div>
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Ngăn chặn click vào card
              onTagClick(event.category);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur shadow-md hover:scale-105 transition-all cursor-pointer hover:bg-white"
            style={{ color: event.color }}
            title={`Lọc theo: ${event.category}`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color }}></span>
            {event.category}
          </button>
        </div>
        <button className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#FF6B6B] hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
          <Heart size={18} fill="currentColor" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-[#2C3E50] mb-2 line-clamp-2 leading-tight group-hover:text-[#34729C] transition-colors">
            {event.title}
          </h3>
          <p className="text-xs text-[#34729C] font-semibold mb-4 bg-[#F0F7FF] inline-block px-2 py-1 rounded-md">{event.org}</p>

          <div className="space-y-2.5 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[#5FC1D1]">
                <Calendar size={16} />
              </div>
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[#5FC1D1]">
                <MapPin size={16} />
              </div>
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-auto pt-5 border-t border-dashed border-gray-100">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-[#34729C] flex items-center gap-1"><Users size={14}/> {event.joined} tham gia</span>
            <span className="text-gray-400">Mục tiêu {event.total}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 relative"
              style={{ width: `${percent}%`, backgroundColor: event.color }}
            >
               <div className="absolute top-0 left-0 bottom-0 w-full bg-white/20 animate-pulse"></div>
            </div>
          </div>

          <button
            onClick={() => onCardClick(event.id)}
            className="w-full py-3 bg-[#F0F4F8] text-[#2C3E50] font-bold rounded-xl text-sm hover:bg-[#34729C] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group-btn shadow-sm hover:shadow-md"
          >
            Xem chi tiết
            <ArrowRight size={16} className="transform group-btn-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Mock user data (in real app, this would come from auth context/store)
  const userProfile = {
    name: "Nguyễn Thu Hà",
    role: "Tình nguyện viên",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý khi click vào tag trên card
  const handleTagClick = (categoryName: string) => {
    const category = CATEGORIES.find(c => c.name === categoryName);
    if (category) {
      setActiveCategory(category.id);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  // Xử lý khi click vào card để xem chi tiết
  const handleCardClick = (eventId: number) => {
    navigate(`/event/${eventId}`);
  };

  const filteredEvents = EVENTS_DATA.filter(event => {
    const matchesCategory = activeCategory === 'all' ||
      CATEGORIES.find(c => c.id === activeCategory)?.name === event.category;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  const activeCategoryName = CATEGORIES.find(c => c.id === activeCategory)?.name || "Tất cả";

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#2C3E50]">
      {/* --- CUSTOM NAVBAR FOR EVENTS PAGE --- */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#34729C] to-[#5FC1D1] rounded-xl rotate-3 group-hover:rotate-6 transition-transform flex items-center justify-center text-white shadow-lg shadow-[#5FC1D1]/30">
              <Heart fill="white" size={20} />
            </div>
            <span className={`text-2xl font-bold tracking-tight ${scrolled ? 'text-[#2C3E50]' : 'text-[#34729C]'}`}>
              Volunteer<span className="text-[#5FC1D1]">Hub</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigate('/')} className="relative text-[#2C3E50] font-medium transition-colors hover:text-[#34729C] group">
              Trang chủ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5FC1D1] transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button onClick={() => navigate('/events')} className="relative text-[#34729C] font-medium transition-colors hover:text-[#34729C] group">
              Sự kiện
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#5FC1D1]"></span>
            </button>
            <a href="#" className="relative text-[#2C3E50] font-medium transition-colors hover:text-[#34729C] group">
              Cộng đồng
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5FC1D1] transition-all duration-300 group-hover:w-full"></span>
            </a>

            {/* Notification Button */}
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Avatar & Info */}
            <div
              className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              onClick={() => navigate('/volunteer/dashboard')}
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-[#2C3E50]">{userProfile.name}</p>
                <p className="text-xs text-gray-500">{userProfile.role}</p>
              </div>
              <img src={userProfile.avatar} alt="Avatar" className="w-10 h-10 rounded-full ring-2 ring-[#5FC1D1] object-cover" />
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
            {/* Mobile Notification */}
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Mobile Avatar */}
            <div
              className="cursor-pointer"
              onClick={() => navigate('/volunteer/dashboard')}
            >
              <img src={userProfile.avatar} alt="Avatar" className="w-8 h-8 rounded-full ring-2 ring-[#5FC1D1] object-cover" />
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#2C3E50] p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={28} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl absolute top-full w-full border-t border-gray-100 animate-fade-in-down">
            <div className="flex flex-col p-4 space-y-4">
              <button onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} className="text-[#2C3E50] font-medium p-3 hover:bg-[#F5F7FA] rounded-xl text-left">
                Trang chủ
              </button>
              <button onClick={() => { navigate('/events'); setIsMobileMenuOpen(false); }} className="text-[#34729C] font-medium p-3 hover:bg-[#F5F7FA] rounded-xl text-left">
                Sự kiện
              </button>
              <a href="#" className="text-[#2C3E50] font-medium p-3 hover:bg-[#F5F7FA] rounded-xl">
                Cộng đồng
              </a>

              {/* Mobile User Info */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex items-center gap-3 p-3">
                  <img src={userProfile.avatar} alt="Avatar" className="w-12 h-12 rounded-full ring-2 ring-[#5FC1D1] object-cover" />
                  <div>
                    <p className="text-sm font-bold text-[#2C3E50]">{userProfile.name}</p>
                    <p className="text-xs text-gray-500">{userProfile.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- HERO / HEADER SECTION --- */}
      {/* FIXED: Removed 'overflow-hidden' from the parent container.
          Added a separate absolute container for the background blobs with 'overflow-hidden'.
          This allows the dropdown menu (z-50) to flow outside the header area visible.
      */}
      <div className="relative bg-white pt-24 pb-8">
        {/* Animated Background Blobs Container */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#D1ECFF] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#C9F1FC] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal>
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#2C3E50] mb-4 mt-8">
                Khám phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34729C] to-[#5FC1D1]">Sự Kiện Ý Nghĩa</span>
              </h1>
              <p className="text-[#6C757D] text-lg max-w-2xl mx-auto">
                Tìm kiếm cơ hội tình nguyện phù hợp với đam mê của bạn và tạo ra những tác động tích cực cho cộng đồng.
              </p>
            </div>
          </Reveal>

          {/* Floating Search & Filter Bar */}
          <Reveal delay={100}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-[#34729C]/10 border border-white/50 p-3 md:p-4 mb-8 transform md:-translate-y-0 max-w-4xl mx-auto relative z-50">
              <div className="flex flex-col md:flex-row gap-3 items-center">
                {/* Search Input */}
                <div className="relative w-full md:flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#34729C] transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-3.5 bg-[#F8F9FA] border-transparent text-gray-900 placeholder-gray-400 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5FC1D1]/30 focus:border-[#5FC1D1] transition-all font-medium"
                    placeholder="Tìm kiếm theo tên sự kiện, địa điểm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative w-full md:w-auto" ref={filterRef}>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`w-full md:w-56 flex items-center justify-between gap-2 px-5 py-3.5 rounded-2xl font-bold transition-all shadow-sm border ${
                      isFilterOpen || activeCategory !== 'all'
                        ? 'bg-[#34729C] text-white border-[#34729C] shadow-[#34729C]/20'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#34729C] hover:text-[#34729C]'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Filter size={18} />
                      <span className="truncate">{activeCategoryName}</span>
                    </span>
                    <ChevronDown size={18} className={`transition-transform duration-300 flex-shrink-0 ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isFilterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-full md:w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-fade-in-up max-h-80 overflow-y-auto">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => { setActiveCategory(cat.id); setIsFilterOpen(false); }}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                            activeCategory === cat.id
                              ? 'bg-[#F0F7FF] text-[#34729C]'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <span className="flex-1">{cat.name}</span>
                          {activeCategory === cat.id && <Check size={16} className="text-[#34729C]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* --- EVENTS GRID --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-0">
        {sortedEvents.length > 0 ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-[#5FC1D1] rounded-full"></div>
                <h2 className="text-xl font-bold text-[#2C3E50]">
                  Kết quả tìm kiếm <span className="text-gray-400 font-normal">({sortedEvents.length})</span>
                </h2>
              </div>

              {/* Sort Controls */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 text-sm text-gray-500 font-bold cursor-pointer hover:text-[#34729C] transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <ArrowDownUp size={16} />
                  Sắp xếp: {sortOrder === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-fade-in-up">
                    <button
                      onClick={() => { setSortOrder('newest'); setIsSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 flex items-center justify-between ${sortOrder === 'newest' ? 'text-[#34729C]' : 'text-gray-600'}`}
                    >
                      Mới nhất
                      {sortOrder === 'newest' && <Clock size={16} />}
                    </button>
                    <button
                      onClick={() => { setSortOrder('oldest'); setIsSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 flex items-center justify-between ${sortOrder === 'oldest' ? 'text-[#34729C]' : 'text-gray-600'}`}
                    >
                      Cũ nhất
                      {sortOrder === 'oldest' && <Clock size={16} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedEvents.map((event, index) => (
                <Reveal key={event.id} delay={index * 100}>
                  <EventCard event={event} onTagClick={handleTagClick} onCardClick={handleCardClick} />
                </Reveal>
              ))}
            </div>

            {/* Pagination / Load More */}
            <Reveal delay={200}>
              <div className="mt-16 text-center">
                <button className="px-10 py-4 bg-white border-2 border-[#D1ECFF] text-[#34729C] font-bold rounded-full hover:bg-[#34729C] hover:border-[#34729C] hover:text-white hover:shadow-xl hover:shadow-[#34729C]/20 transition-all duration-300 transform hover:-translate-y-1">
                  Xem thêm sự kiện
                </button>
              </div>
            </Reveal>
          </>
        ) : (
          /* Empty State */
          <Reveal>
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm mx-auto max-w-2xl">
              <div className="w-32 h-32 bg-[#F8F9FA] rounded-full flex items-center justify-center mb-6 relative">
                <Search size={64} className="text-gray-300" />
                <div className="absolute top-0 right-0 w-8 h-8 bg-[#FF6B6B] rounded-full flex items-center justify-center text-white font-bold text-lg animate-bounce">?</div>
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50] mb-3">Không tìm thấy kết quả nào</h3>
              <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                Rất tiếc, chúng tôi không tìm thấy sự kiện nào phù hợp với từ khóa
                <span className="font-bold text-[#34729C]"> "{searchQuery}"</span> và bộ lọc hiện tại.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="px-8 py-3 bg-gradient-to-r from-[#34729C] to-[#5FC1D1] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Xóa bộ lọc & Thử lại
              </button>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
};

export default EventsPage;