import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Users, Share2, Heart, ArrowLeft,
  CheckCircle, MessageSquare, Map, Info, User, Shield,
  AlertCircle, ChevronRight, ToggleLeft, ToggleRight
} from 'lucide-react';
import { getEventById } from '../../services/event.service';
import { applyForEvent, getMyRegistrationForEvent, cancelRegistration, checkInByCode } from '../../services/registration.service';
import type { BackendEvent } from '../../services/event.service';
import type { BackendRegistration } from '../../services/registration.service';

/* --- COMPONENT: EVENT DETAIL PAGE --- */

const EventDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // API state
  const [event, setEvent] = useState<BackendEvent | null>(null);
  const [userRegistration, setUserRegistration] = useState<BackendRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Computed states based on API data
  const userStatus = userRegistration?.status === 'approved' ? 'approved' :
                    userRegistration?.status === 'pending' ? 'pending' : 'guest';

  const isEventOngoing = event ? (() => {
    const now = new Date();
    const startDate = new Date(event.schedule.startDate);
    const endDate = new Date(event.schedule.endDate);
    return now >= startDate && now <= endDate;
  })() : false;

  // Fetch event data and user registration status
  const fetchEventData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch event details
      const eventData = await getEventById(id);
      setEvent(eventData);

      // Fetch user's registration status for this event
      try {
        const registration = await getMyRegistrationForEvent(id);
        setUserRegistration(registration);
      } catch (regError) {
        // User might not be registered, that's okay
        setUserRegistration(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id]);

  // Helper functions to transform backend data
  const getEventImage = (event: BackendEvent) => {
    return event.media.images[0] || "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
  };

  const getEventDate = (event: BackendEvent) => {
    const date = new Date(event.schedule.startDate);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEventTime = (event: BackendEvent) => {
    const start = new Date(event.schedule.startDate);
    const end = new Date(event.schedule.endDate);
    const startTime = start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  };

  const getEventLocation = (event: BackendEvent) => {
    const parts = [event.location.address, event.location.district, event.location.city].filter(Boolean);
    return parts.join(', ');
  };

  const getEventJoined = (event: BackendEvent) => {
    return event.capacity.currentVolunteers;
  };

  const getEventTotal = (event: BackendEvent) => {
    return event.capacity.maxVolunteers;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#2C3E50] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34729C] mx-auto mb-4"></div>
          <p>Đang tải thông tin sự kiện...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#2C3E50] flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-8 shadow-sm border border-red-100 max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-red-600 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={() => fetchEventData()}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // No event data
  if (!event) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#2C3E50] flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-md">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">Không tìm thấy sự kiện</h3>
          <p className="text-gray-500 mb-6">Sự kiện này có thể không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-3 bg-[#34729C] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            Quay lại danh sách sự kiện
          </button>
        </div>
      </div>
    );
  }

  // Xử lý đăng ký
  const handleJoin = async () => {
    if (!event) return;

    try {
      setActionLoading(true);
      await applyForEvent({
        eventId: event.id,
        motivation: "I want to contribute to this meaningful event"
      });

      // Refresh registration status
      const registration = await getMyRegistrationForEvent(event.id);
      setUserRegistration(registration);

      alert("Đăng ký thành công! Vui lòng chờ Ban tổ chức duyệt.");
    } catch (err) {
      console.error('Error applying for event:', err);
      alert("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  // Xử lý Check-in
  const handleCheckIn = async () => {
    if (!userRegistration) return;

    try {
      setActionLoading(true);
      // For now, we'll use a simple check-in without QR code
      // In a real app, this would involve QR code scanning
      const code = prompt("Nhập mã check-in:");
      if (!code) return;

      await checkInByCode(code);

      // Refresh registration status
      const registration = await getMyRegistrationForEvent(event!.id);
      setUserRegistration(registration);

      alert("Check-in thành công! Chúc bạn có một buổi tình nguyện ý nghĩa.");
    } catch (err) {
      console.error('Error checking in:', err);
      alert("Có lỗi xảy ra khi check-in. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
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
        <img src={getEventImage(event)} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white max-w-7xl mx-auto">
          <span
            className="inline-block px-3 py-1 mb-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30"
          >
            {event.categoryName}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight shadow-sm">{event.title}</h1>
          <div className="flex items-center gap-4 text-sm md:text-base font-medium">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Users size={16} /> {getEventJoined(event)}/{getEventTotal(event)} Đã đăng ký
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
                  <p className="text-lg font-bold text-[#2C3E50]">{getEventDate(event)}</p>
                  <p className="text-sm text-gray-500">{getEventTime(event)}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#F3E5F5] text-[#9C27B0] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase">Địa điểm</p>
                  <p className="text-lg font-bold text-[#2C3E50]">{getEventLocation(event)}</p>
                  <a href="#" className="text-[#34729C] text-sm font-bold hover:underline">Xem bản đồ</a>
                </div>
              </div>
            </div>

            {/* Organizer Mini Profile */}
            <div className="md:border-l md:border-gray-100 md:pl-6 flex items-center gap-4">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80" alt={event.organizerName} className="w-14 h-14 rounded-full border-2 border-white shadow-md" />
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Tổ chức bởi</p>
                <p className="text-base font-bold text-[#2C3E50] mb-1">{event.organizerName}</p>
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
              <div className="flex gap-4 relative z-10">
                <div className="w-14 text-sm font-bold text-gray-400 pt-1 text-right">{getEventTime(event).split(' - ')[0]}</div>
                <div className="w-3 h-3 bg-[#34729C] rounded-full mt-2 ring-4 ring-white shadow-sm"></div>
                <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-medium text-[#2C3E50]">Sự kiện bắt đầu</p>
                </div>
              </div>
              <div className="flex gap-4 relative z-10">
                <div className="w-14 text-sm font-bold text-gray-400 pt-1 text-right">{getEventTime(event).split(' - ')[1]}</div>
                <div className="w-3 h-3 bg-[#34729C] rounded-full mt-2 ring-4 ring-white shadow-sm"></div>
                <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-medium text-[#2C3E50]">Sự kiện kết thúc</p>
                </div>
              </div>
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
                        <span className="font-bold text-[#2C3E50]">{getEventTotal(event) - getEventJoined(event)} chỗ</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-[#34729C] h-2 rounded-full" style={{ width: `${(getEventJoined(event)/getEventTotal(event))*100}%` }}></div>
                      </div>
                    </div>
                    <button
                      onClick={handleJoin}
                      disabled={actionLoading}
                      className="w-full py-4 bg-[#34729C] text-white font-bold rounded-xl shadow-lg shadow-[#34729C]/30 hover:bg-[#2a5d80] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        'Đăng ký ngay'
                      )}
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