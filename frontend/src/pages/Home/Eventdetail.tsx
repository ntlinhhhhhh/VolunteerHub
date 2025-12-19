import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Role {
  id: string;
  name: string;
  description: string;
  slots: number;
  filled: number;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string | null;
  categoryId: string;
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
  requirements: {
    minAge: number;
    maxAge: number;
    skills: string[];
    experience: string;
    healthRequirements: string;
  };
  capacity: {
    maxVolunteers: number;
    currentVolunteers: number;
    minVolunteers: number;
  };
  roles: Role[];
  status: string;
  media: {
    images: string[];
    videos: string[];
    documents: string[];
  };
  tags: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8000/events/${id}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setEvent(data.data);
      }
    } catch (error) {
      console.error('Error fetching event detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const hours = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    return hours;
  };

  const handleJoinClick = (roleId?: string) => {
    setSelectedRole(roleId || null);
    setShowLoginPrompt(true);
  };

  const handleLoginRedirect = () => {
    localStorage.setItem('pendingEventRegistration', JSON.stringify({
      eventId: id,
      roleId: selectedRole
    }));
    navigate('/login');
  };

  if (loading) {
    return (
      <>
        <div className="loading-container">
          <div className="loading-text">Đang tải thông tin sự kiện...</div>
        </div>
        <style>{loadingStyles}</style>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <div className="loading-container">
          <div className="error-text">Không tìm thấy sự kiện</div>
          <button className="back-btn" onClick={() => navigate('/')}>
            Quay về trang chủ
          </button>
        </div>
        <style>{loadingStyles}</style>
      </>
    );
  }

  const eventImage = event.media.images[0]?.startsWith('/uploads') 
    ? `http://localhost:8000${event.media.images[0]}`
    : event.media.images[0];

  return (
    <>
      <div className="event-detail-container">
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="nav-content">
            <div className="nav-brand" onClick={() => navigate('/')}>
              Volunteer<span className="brand-highlight">Hub</span>
            </div>
            <button className="btn-back" onClick={() => navigate('/')}>
              ← Trang chủ
            </button>
          </div>
        </nav>

        {/* Hero Image */}
        <div className="hero-image">
          <img src={eventImage} alt={event.title} className="hero-img" />
          <div className="hero-overlay">
            <div className="hero-overlay-content">
              <span className="category-badge">{event.categoryName}</span>
            </div>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          <div className="main-content">
            {/* Title Section */}
            <div className="title-section">
              <h1 className="event-title">{event.title}</h1>
              <span className="status-badge">
                {event.status === 'published' ? '🟢 Đang mở đăng ký' : '⚪ Đã đóng'}
              </span>
            </div>

            {/* Quick Info */}
            <div className="quick-info">
              <div className="info-item">
                <span className="info-icon">📅</span>
                <div>
                  <div className="info-label">Thời gian</div>
                  <div className="info-value">{formatDate(event.schedule.startDate)}</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div>
                  <div className="info-label">Địa điểm</div>
                  <div className="info-value">{event.location.city}</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">👥</span>
                <div>
                  <div className="info-label">Tình nguyện viên</div>
                  <div className="info-value">{event.capacity.currentVolunteers}/{event.capacity.maxVolunteers}</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">⏱️</span>
                <div>
                  <div className="info-label">Thời lượng</div>
                  <div className="info-value">{calculateDuration(event.schedule.startDate, event.schedule.endDate)} giờ</div>
                </div>
              </div>
            </div>

            {/* Mobile Join Card */}
            <div className="mobile-join-card">
              <h3 className="join-title">Tham gia ngay</h3>
              <div className="join-stats">
                <div className="stat-item">
                  <div className="stat-number">{event.capacity.maxVolunteers - event.capacity.currentVolunteers}</div>
                  <div className="stat-label">Vị trí còn lại</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-number">{event.capacity.currentVolunteers}</div>
                  <div className="stat-label">Đã đăng ký</div>
                </div>
              </div>
              <button className="btn-join" onClick={() => handleJoinClick()}>Đăng ký tham gia</button>
              <div className="deadline">⏰ Hạn: {formatDate(event.schedule.registrationDeadline)}</div>
            </div>

            {/* Description */}
            <section className="section">
              <h2 className="section-title">Giới thiệu</h2>
              <p className="description">{event.description}</p>
            </section>

            {/* Schedule */}
            <section className="section">
              <h2 className="section-title">Thời gian chi tiết</h2>
              <div className="schedule-grid">
                <div className="schedule-item">
                  <div className="schedule-label">🗓️ Bắt đầu</div>
                  <div className="schedule-value">{formatDateTime(event.schedule.startDate)}</div>
                </div>
                <div className="schedule-item">
                  <div className="schedule-label">🏁 Kết thúc</div>
                  <div className="schedule-value">{formatDateTime(event.schedule.endDate)}</div>
                </div>
                <div className="schedule-item">
                  <div className="schedule-label">⏰ Hạn đăng ký</div>
                  <div className="schedule-value">{formatDateTime(event.schedule.registrationDeadline)}</div>
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="section">
              <h2 className="section-title">Địa điểm</h2>
              <div className="location-card">
                <span className="location-icon">📍</span>
                <div>
                  <div className="location-address">{event.location.address}</div>
                  <div className="location-detail">{event.location.district}, {event.location.city}</div>
                </div>
              </div>
            </section>

            {/* Requirements */}
            <section className="section">
              <h2 className="section-title">Yêu cầu tham gia</h2>
              <div className="requirements-grid">
                <div className="requirement-item">
                  <div className="req-label">👤 Độ tuổi</div>
                  <div className="req-value">{event.requirements.minAge} - {event.requirements.maxAge} tuổi</div>
                </div>
                <div className="requirement-item">
                  <div className="req-label">💪 Sức khỏe</div>
                  <div className="req-value">{event.requirements.healthRequirements}</div>
                </div>
                <div className="requirement-item">
                  <div className="req-label">📚 Kinh nghiệm</div>
                  <div className="req-value">{event.requirements.experience}</div>
                </div>
              </div>
              {event.requirements.skills.length > 0 && (
                <div className="skills-section">
                  <div className="skills-label">🎯 Kỹ năng cần thiết:</div>
                  <div className="skills-tags">
                    {event.requirements.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Roles */}
            <section className="section">
              <h2 className="section-title">Các vị trí tình nguyện</h2>
              <div className="roles-grid">
                {event.roles.map((role) => (
                  <div key={role.id} className="role-card">
                    <div className="role-header">
                      <h3 className="role-name">{role.name}</h3>
                      <span className="role-slots">{role.filled}/{role.slots}</span>
                    </div>
                    <p className="role-desc">{role.description}</p>
                    <button
                      className={`btn-role ${role.filled >= role.slots ? 'disabled' : ''}`}
                      onClick={() => handleJoinClick(role.id)}
                      disabled={role.filled >= role.slots}
                    >
                      {role.filled >= role.slots ? 'Đã đủ người' : 'Đăng ký'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Organizer */}
            <section className="section">
              <h2 className="section-title">Ban tổ chức</h2>
              <div className="organizer-card">
                <span className="organizer-icon">👤</span>
                <div>
                  <div className="organizer-name">{event.organizerName}</div>
                  <div className="organizer-contact">📧 {event.organizerEmail}</div>
                  {event.organizerPhone && (
                    <div className="organizer-contact">📞 {event.organizerPhone}</div>
                  )}
                </div>
              </div>
            </section>

            {/* Tags */}
            {event.tags.length > 0 && (
              <section className="section">
                <h2 className="section-title">Từ khóa</h2>
                <div className="tags-container">
                  {event.tags.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="sidebar">
            <div className="join-card">
              <h3 className="join-title">Tham gia ngay</h3>
              <div className="join-stats">
                <div className="stat-item">
                  <div className="stat-number">{event.capacity.maxVolunteers - event.capacity.currentVolunteers}</div>
                  <div className="stat-label">Vị trí còn lại</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-number">{event.capacity.currentVolunteers}</div>
                  <div className="stat-label">Đã đăng ký</div>
                </div>
              </div>
              <button className="btn-join" onClick={() => handleJoinClick()}>Đăng ký tham gia</button>
              <div className="deadline">⏰ Hạn: {formatDate(event.schedule.registrationDeadline)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginPrompt && (
        <div className="modal-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Đăng nhập để tham gia</h2>
            <p className="modal-text">
              Bạn cần đăng nhập hoặc đăng ký tài khoản để có thể đăng ký tham gia sự kiện này.
            </p>
            <div className="modal-buttons">
              <button className="btn-modal-primary" onClick={handleLoginRedirect}>Đăng nhập</button>
              <button className="btn-modal-secondary" onClick={() => navigate('/register')}>Đăng ký tài khoản</button>
            </div>
            <button className="btn-modal-close" onClick={() => setShowLoginPrompt(false)}>Đóng</button>
          </div>
        </div>
      )}

      <style>{eventDetailStyles}</style>
    </>
  );
};

const loadingStyles = `
  .loading-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .loading-text {
    font-size: 18px;
    color: #5a5a5a;
  }
  .error-text {
    font-size: 20px;
    color: #dc3545;
    font-weight: 600;
  }
  .back-btn {
    padding: 12px 32px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
  }
`;

const eventDetailStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .event-detail-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica', 'Arial', sans-serif;
    min-height: 100vh;
    background-color: #f8f9fa;
    width: 100vw;
  }

  .navbar {
    width: 100%;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .nav-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-brand {
    font-size: 24px;
    font-weight: 300;
    cursor: pointer;
    color: #1a1a1a;
  }

  .brand-highlight {
    color: #007bff;
    font-weight: 700;
  }

  .btn-back {
    padding: 8px 20px;
    background: transparent;
    color: #007bff;
    border: 2px solid #007bff;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-back:hover {
    background-color: #007bff;
    color: white;
  }

  .hero-image {
    width: 100%;
    height: 400px;
    position: relative;
    overflow: hidden;
  }

  .hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4));
    display: flex;
    align-items: flex-end;
  }

  .hero-overlay-content {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 24px;
  }

  .category-badge {
    display: inline-block;
    background-color: rgba(255, 255, 255, 0.95);
    color: #007bff;
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
  }

  .content-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px 24px;
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 32px;
  }

  .main-content {
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .mobile-join-card {
    display: none;
    background: #f8f9fa;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
  }

  .title-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid #f0f0f0;
    gap: 16px;
  }

  .event-title {
    font-size: 36px;
    font-weight: 700;
    color: #1a1a1a;
    flex: 1;
    line-height: 1.3;
  }

  .status-badge {
    background-color: #e8f5e9;
    color: #2e7d32;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }

  .quick-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  .info-item {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .info-icon {
    font-size: 24px;
  }

  .info-label {
    font-size: 12px;
    color: #5a5a5a;
    margin-bottom: 4px;
  }

  .info-value {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .section {
    margin-bottom: 40px;
  }

  .section-title {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #007bff;
  }

  .description {
    font-size: 16px;
    line-height: 1.8;
    color: #4a4a4a;
  }

  .schedule-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .schedule-item {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
  }

  .schedule-label {
    font-size: 14px;
    color: #5a5a5a;
    margin-bottom: 8px;
  }

  .schedule-value {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .location-card {
    background: #f8f9fa;
    padding: 24px;
    border-radius: 8px;
    display: flex;
    gap: 16px;
  }

  .location-icon {
    font-size: 32px;
  }

  .location-address {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .location-detail {
    font-size: 15px;
    color: #5a5a5a;
  }

  .requirements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .requirement-item {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
  }

  .req-label {
    font-size: 14px;
    color: #5a5a5a;
    margin-bottom: 8px;
  }

  .req-value {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .skills-section {
    background: #fff3e0;
    padding: 20px;
    border-radius: 8px;
  }

  .skills-label {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 12px;
  }

  .skills-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .skill-tag {
    background: #ff9800;
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
  }

  .roles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .role-card {
    background: #f8f9fa;
    padding: 24px;
    border-radius: 8px;
    transition: all 0.3s;
  }

  .role-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .role-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .role-name {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .role-slots {
    background: #007bff;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
  }

  .role-desc {
    font-size: 15px;
    color: #5a5a5a;
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .btn-role {
    width: 100%;
    padding: 12px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-role:hover:not(.disabled) {
    background: #0056b3;
  }

  .btn-role.disabled {
    background: #dee2e6;
    color: #6c757d;
    cursor: not-allowed;
  }

  .organizer-card {
    background: #f8f9fa;
    padding: 24px;
    border-radius: 8px;
    display: flex;
    gap: 16px;
  }

  .organizer-icon {
    font-size: 32px;
  }

  .organizer-name {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 8px;
  }

  .organizer-contact {
    font-size: 15px;
    color: #5a5a5a;
    margin-bottom: 4px;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    background: #e3f2fd;
    color: #1976d2;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
  }

  .sidebar {
    position: relative;
  }

  .join-card {
    position: sticky;
    top: 80px;
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .join-title {
    font-size: 22px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 20px;
    text-align: center;
  }

  .join-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 24px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-number {
    font-size: 32px;
    font-weight: 700;
    color: #007bff;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 13px;
    color: #5a5a5a;
  }

  .stat-divider {
    width: 1px;
    background: #dee2e6;
  }

  .btn-join {
    width: 100%;
    padding: 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 16px;
    transition: all 0.2s;
  }

  .btn-join:hover {
    background: #0056b3;
    transform: translateY(-2px);
  }

  .deadline {
    text-align: center;
    font-size: 14px;
    color: #dc3545;
    padding: 12px;
    background: #fff5f5;
    border-radius: 6px;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    padding: 20px;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 40px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .modal-title {
    font-size: 26px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 16px;
    text-align: center;
  }

  .modal-text {
    font-size: 16px;
    color: #5a5a5a;
    line-height: 1.6;
    margin-bottom: 24px;
    text-align: center;
  }

  .modal-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
  }

  .btn-modal-primary,
  .btn-modal-secondary,
  .btn-modal-close {
    width: 100%;
    padding: 14px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-modal-primary {
    background: #007bff;
    color: white;
    border: none;
  }

  .btn-modal-primary:hover {
    background: #0056b3;
  }

  .btn-modal-secondary {
    background: #28a745;
    color: white;
    border: none;
  }

  .btn-modal-secondary:hover {
    background: #1e7e34;
  }

  .btn-modal-close {
    background: transparent;
    color: #5a5a5a;
    border: 2px solid #dee2e6;
  }

  .btn-modal-close:hover {
    background: #f8f9fa;
  }

  @media (max-width: 1024px) {
    .content-wrapper {
      grid-template-columns: 1fr;
    }

    .sidebar {
      display: none;
    }

    .mobile-join-card {
      display: block;
    }

    .hero-image {
      height: 300px;
    }

    .event-title {
      font-size: 28px;
    }
  }

  @media (max-width: 768px) {
    .nav-content {
      padding: 12px 16px;
    }

    .nav-brand {
      font-size: 20px;
    }

    .hero-image {
      height: 250px;
    }

    .hero-overlay-content {
      padding: 20px 16px;
    }

    .content-wrapper {
      padding: 20px 16px;
    }

    .main-content {
      padding: 20px;
    }

    .title-section {
      flex-direction: column;
      align-items: flex-start;
    }

    .event-title {
      font-size: 24px;
    }

    .quick-info {
      grid-template-columns: repeat(2, 1fr);
    }

    .section-title {
      font-size: 20px;
    }

    .schedule-grid,
    .requirements-grid {
      grid-template-columns: 1fr;
    }

    .roles-grid {
      grid-template-columns: 1fr;
    }

    .modal-content {
      padding: 24px;
    }

    .modal-title {
      font-size: 22px;
    }
  }

  @media (max-width: 480px) {
    .event-title {
      font-size: 20px;
    }

    .quick-info {
      grid-template-columns: 1fr;
    }

    .info-item {
      padding: 16px;
    }

    .section-title {
      font-size: 18px;
    }
  }
`;

export default EventDetail;