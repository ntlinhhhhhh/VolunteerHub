import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Users, Share2, Heart, ArrowLeft,
  CheckCircle, MessageSquare, Map, Info, User, Shield,
  AlertCircle, ChevronRight, ToggleLeft, ToggleRight
} from 'lucide-react';

/* --- COMPONENT: EVENT DETAIL PAGE --- */

const EventDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // --- MOCK STATE (Mô phỏng trạng thái từ Backend) ---
  // guest: Chưa tham gia
  // pending: Đã đăng ký, chờ duyệt
  // approved: Đã được duyệt
  const [userStatus, setUserStatus] = useState<'guest' | 'pending' | 'approved'>('guest');

  // Trạng thái sự kiện (để test nút check-in)
  const [isEventOngoing, setIsEventOngoing] = useState(false);

  // Mock Data sự kiện
  const event = {
    id: 1,
    title: "Chiến dịch Xanh: Làm sạch bãi biển Mỹ Khê",
    org: "Green Earth Vietnam",
    orgAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80",
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    date: "20 Tháng 12, 2024",
    time: "07:00 AM - 11:00 AM",
    location: "Bãi biển Mỹ Khê, Sơn Trà, Đà Nẵng",
    category: "Môi trường",
    color: "#6BCB77",
    joined: 45,
    total: 50,
    description: `
      <p>Tham gia cùng chúng tôi trong chiến dịch làm sạch bãi biển lớn nhất năm tại Đà Nẵng! Đây là cơ hội tuyệt vời để bạn đóng góp trực tiếp vào việc bảo vệ môi trường biển và lan tỏa thông điệp sống xanh.</p>
      <br/>
      <p><strong>Hoạt động chính:</strong></p>
      <ul>
        <li>Thu gom rác thải nhựa dọc bờ biển.</li>
        <li>Phân loại rác tại nguồn để tái chế.</li>
        <li>Tuyên truyền cho du khách về ý thức giữ gìn vệ sinh chung.</li>
      </ul>
      <br/>
      <p>Ban tổ chức sẽ chuẩn bị đầy đủ dụng cụ (găng tay, kẹp rác, bao đựng) và nước uống cho tất cả tình nguyện viên. Hãy mang theo tinh thần nhiệt huyết của bạn!</p>
    `,
    agenda: [
      { time: "06:30", activity: "Tập trung & Điểm danh" },
      { time: "07:00", activity: "Phổ biến quy định an toàn & Phân nhóm" },
      { time: "07:30", activity: "Bắt đầu thu gom rác theo khu vực" },
      { time: "10:30", activity: "Tập kết rác & Tổng kết" },
      { time: "11:00", activity: "Chụp ảnh lưu niệm & Kết thúc" }
    ]
  };

  // Xử lý đăng ký
  const handleJoin = () => {
    // Gọi API đăng ký ở đây
    // Giả lập loading...
    setTimeout(() => {
      setUserStatus('pending'); // Chuyển sang trạng thái chờ duyệt
      alert("Đăng ký thành công! Vui lòng chờ Ban tổ chức duyệt.");
    }, 500);
  };

  // Xử lý Check-in
  const handleCheckIn = () => {
    // Gọi API check-in (có thể yêu cầu geolocation)
    alert("Check-in thành công! Chúc bạn có một buổi tình nguyện ý nghĩa.");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#2C3E50] pb-20">

      {/* --- HEADER NAVIGATION --- */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#34729C] transition-colors font-medium"
          >
            <ArrowLeft size={20} /> Quay lại
          </button>
          <div className="flex gap-3">
            <button className="p-2 text-gray-400 hover:text-[#FF6B6B] hover:bg-red-50 rounded-full transition-colors">
              <Heart size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-[#34729C] hover:bg-blue-50 rounded-full transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* --- HERO IMAGE --- */}
      <div className="relative h-64 md:h-96 w-full bg-gray-200">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white max-w-7xl mx-auto">
          <span
            className="inline-block px-3 py-1 mb-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30"
            style={{ color: event.color ? '#fff' : 'inherit' }}
          >
            {event.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight shadow-sm">{event.title}</h1>
          <div className="flex items-center gap-4 text-sm md:text-base font-medium">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Users size={16} /> {event.joined}/{event.total} Đã đăng ký
            </div>
            {isEventOngoing && (
              <div className="flex items-center gap-2 bg-green-500/80 backdrop-blur-sm px-3 py-1.5 rounded-full animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full"></span> Đang diễn ra
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- LEFT COLUMN: CONTENT --- */}
        <div className="lg:col-span-2 space-y-8">

          {/* Info Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 md:items-center">
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E0F7FA] text-[#34729C] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase">Ngày tổ chức</p>
                  <p className="text-lg font-bold text-[#2C3E50]">{event.date}</p>
                  <p className="text-sm text-gray-500">{event.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#F3E5F5] text-[#9C27B0] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase">Địa điểm</p>
                  <p className="text-lg font-bold text-[#2C3E50]">{event.location}</p>
                  <a href="#" className="text-[#34729C] text-sm font-bold hover:underline">Xem bản đồ</a>
                </div>
              </div>
            </div>

            {/* Organizer Mini Profile */}
            <div className="md:border-l md:border-gray-100 md:pl-6 flex items-center gap-4">
              <img src={event.orgAvatar} alt={event.org} className="w-14 h-14 rounded-full border-2 border-white shadow-md" />
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Tổ chức bởi</p>
                <p className="text-base font-bold text-[#2C3E50] mb-1">{event.org}</p>
                <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-bold transition-colors">
                  Xem hồ sơ
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
              <Info size={20} className="text-[#34729C]" /> Thông tin chi tiết
            </h3>
            <div
              className="prose prose-blue text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: event.description }}
            ></div>
          </div>

          {/* Agenda */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-[#2C3E50] mb-6 flex items-center gap-2">
              <Clock size={20} className="text-[#34729C]" /> Lịch trình
            </h3>
            <div className="space-y-6 relative">
              <div className="absolute top-2 left-[27px] w-0.5 h-[90%] bg-gray-100"></div>
              {event.agenda.map((item, idx) => (
                <div key={idx} className="flex gap-4 relative z-10">
                  <div className="w-14 text-sm font-bold text-gray-400 pt-1 text-right">{item.time}</div>
                  <div className="w-3 h-3 bg-[#34729C] rounded-full mt-2 ring-4 ring-white shadow-sm"></div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="font-medium text-[#2C3E50]">{item.activity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN: ACTION CARD (STICKY) --- */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">

            {/* Status & Action Card */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-[#34729C]/10 overflow-hidden relative">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D1ECFF] rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>

              <div className="relative z-10">
                <h3 className="text-lg font-bold text-[#2C3E50] mb-4">Đăng ký tham gia</h3>

                {/* --- LOGIC DISPLAY BUTTONS --- */}

                {/* CASE 1: CHƯA THAM GIA */}
                {userStatus === 'guest' && (
                  <>
                    <div className="mb-6 space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Số lượng còn lại</span>
                        <span className="font-bold text-[#2C3E50]">{event.total - event.joined} chỗ</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-[#34729C] h-2 rounded-full" style={{ width: `${(event.joined/event.total)*100}%` }}></div>
                      </div>
                    </div>
                    <button
                      onClick={handleJoin}
                      className="w-full py-4 bg-[#34729C] text-white font-bold rounded-xl shadow-lg shadow-[#34729C]/30 hover:bg-[#2a5d80] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                      Đăng ký ngay
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-3">Cam kết tham gia đầy đủ khi đăng ký</p>
                  </>
                )}

                {/* CASE 2: ĐÃ ĐĂNG KÝ (CHỜ DUYỆT) */}
                {userStatus === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock size={24} />
                    </div>
                    <h4 className="font-bold text-yellow-800 mb-1">Đang chờ duyệt</h4>
                    <p className="text-sm text-yellow-700">Đơn đăng ký của bạn đang được BTC xem xét. Vui lòng quay lại sau.</p>
                    <button className="w-full mt-4 py-2 border border-yellow-200 text-yellow-700 font-bold rounded-lg hover:bg-yellow-100 transition-colors text-sm">
                      Hủy yêu cầu
                    </button>
                  </div>
                )}

                {/* CASE 3: ĐÃ ĐƯỢC DUYỆT */}
                {userStatus === 'approved' && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                      <div className="bg-green-100 text-green-600 p-2 rounded-full">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-green-800 text-sm">Đăng ký thành công</p>
                        <p className="text-xs text-green-600">Bạn đã là tình nguyện viên chính thức.</p>
                      </div>
                    </div>

                    {/* Nút vào diễn đàn */}
                    <button
                      onClick={() => navigate(`/event/${id}/wall`)}
                      className="w-full py-3 bg-[#E0F7FA] text-[#006064] font-bold rounded-xl hover:bg-[#B2EBF2] transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={18} />
                      Truy cập diễn đàn
                    </button>

                    {/* Nút Check-in (Chỉ hiện khi sự kiện đang diễn ra) */}
                    {isEventOngoing ? (
                      <button
                        onClick={handleCheckIn}
                        className="w-full py-4 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 animate-bounce-slight"
                      >
                        <MapPin size={20} />
                        Check-in Ngay
                      </button>
                    ) : (
                      <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-3">
                        Nút check-in sẽ mở khi sự kiện bắt đầu.
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Safety Tips Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-bold text-[#2C3E50] mb-3 flex items-center gap-2">
                <Shield size={18} className="text-[#34729C]" /> Lưu ý an toàn
              </h4>
              <ul className="text-sm text-gray-500 space-y-2 list-disc pl-4">
                <li>Mang theo bình nước cá nhân.</li>
                <li>Mặc trang phục thoải mái, dễ vận động.</li>
                <li>Tuân thủ hướng dẫn của trưởng nhóm.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>

      {/* --- DEV TOOLS (Floating Toggle for Demo) --- */}
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-xl shadow-2xl z-50 text-xs opacity-90 hover:opacity-100 transition-opacity w-64">
        <p className="font-bold mb-3 text-gray-400 uppercase tracking-widest border-b border-gray-700 pb-1">Công cụ Demo (Dev)</p>

        <div className="flex items-center justify-between mb-3">
          <span>Trạng thái User:</span>
          <select
            value={userStatus}
            onChange={(e) => setUserStatus(e.target.value as 'guest' | 'pending' | 'approved')}
            className="bg-gray-700 text-white rounded px-2 py-1 outline-none border border-gray-600"
          >
            <option value="guest">Chưa tham gia</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span>Sự kiện đang diễn ra?</span>
          <button
            onClick={() => setIsEventOngoing(!isEventOngoing)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${isEventOngoing ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}
          >
            {isEventOngoing ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
            {isEventOngoing ? 'ON' : 'OFF'}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-gray-500 italic">*Dùng bảng này để test các trạng thái nút bấm.</p>
      </div>

      <style>{`
        @keyframes bounce-slight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-slight {
          animation: bounce-slight 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default EventDetailPage;