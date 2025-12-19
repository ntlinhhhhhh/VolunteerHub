import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Feature {
    icon: string;
    title: string;
    description: string;
}

interface Event {
    id: string;
    title: string;
    description: string;
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
    capacity: {
        maxVolunteers: number;
        currentVolunteers: number;
        minVolunteers: number;
    };
    categoryName: string;
    organizerName: string;
}

const features: Feature[] = [
    {
        icon: '🤝',
        title: 'Volunteer Management',
        description: 'Effortlessly track, schedule, and communicate with your volunteer base from one place.',
    },
    {
        icon: '📊',
        title: 'Impact Metrics',
        description: 'Measure the real-world impact of your efforts with clear, insightful dashboards and reporting.',
    },
    {
        icon: '📢',
        title: 'Opportunity Board',
        description: 'Post and manage volunteer opportunities, making it easy for users to find ways to contribute.',
    },
    {
        icon: '✅',
        title: 'Seamless Onboarding',
        description: 'A smooth and guided registration process gets new volunteers active in minutes.',
    },
    {
        icon: '🗺️',
        title: 'Geographic Search',
        description: 'Connect volunteers with opportunities based on their location and availability.',
    },
    {
        icon: '⭐',
        title: 'Recognition System',
        description: 'A built-in badge and rating system to motivate and appreciate high-performing volunteers.',
    },
];

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetchPublishedEvents();
    }, []);

    const fetchPublishedEvents = async () => {
        try {
            const response = await fetch('http://localhost:8000/events?status=published', {
                headers: {
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                setEvents(data.data.slice(0, 6));
            }
        } catch (error) {
            console.error('Error fetching events:', error);
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

    return (
        <>
            <div className="home-container">
                {/* Navigation Bar */}
                <nav className="navbar">
                    <div className="nav-content">
                        <div className="nav-brand" onClick={() => navigate('/')}>
                            Volunteer<span className="brand-highlight">Hub</span>
                        </div>

                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? '✕' : '☰'}
                        </button>

                        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                            <a href="#features" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                            <a href="#events" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Events</a>
                            <a href="#roles" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Roles</a>
                            <a href="#impact" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Impact</a>
                            <button className="btn-signin" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>
                                Sign In
                            </button>
                            <button className="btn-primary" onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}>
                                Get Started
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <header className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Welcome to <span className="hero-brand">VolunteerHub</span>
                        </h1>
                        <p className="hero-subtitle">
                            The all-in-one platform for managing volunteers, tracking service hours, and amplifying your impact.
                        </p>
                        <div className="hero-buttons">
                            <button className="btn-hero-primary" onClick={() => navigate('/register')}>
                                Join as a Volunteer
                            </button>
                            <button className="btn-hero-secondary" onClick={() => navigate('/login')}>
                                Manage My Account
                            </button>
                        </div>
                    </div>
                </header>

                {/* Stats Section */}
                <section className="stats-section" id="impact">
                    <div className="stats-container">
                        <div className="stat-box">
                            <div className="stat-number">100K+</div>
                            <div className="stat-label">Service Hours Tracked</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Active Organizations</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">99.9%</div>
                            <div className="stat-label">Volunteer Satisfaction</div>
                        </div>
                    </div>
                </section>

                {/* Events Section */}
                <section className="events-section" id="events">
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">Upcoming Volunteer Events</h2>
                            <p className="section-subtitle">
                                Join our community and make a difference in upcoming volunteer opportunities.
                            </p>
                        </div>

                        {loading ? (
                            <div className="loading-state">Loading events...</div>
                        ) : (
                            <div className="events-grid">
                                {events.map((event) => (
                                    <div key={event.id} className="event-card" onClick={() => navigate(`/events/${event.id}`)}>
                                        <div className="event-badge">📅 {formatDate(event.schedule.startDate)}</div>
                                        <h3 className="event-title">{event.title}</h3>
                                        <p className="event-description">
                                            {event.description.length > 120
                                                ? `${event.description.substring(0, 120)}...`
                                                : event.description}
                                        </p>
                                        <div className="event-meta">
                                            <div className="event-meta-item">
                                                <span className="meta-icon">📍</span>
                                                <span>{event.location.city}</span>
                                            </div>
                                            <div className="event-meta-item">
                                                <span className="meta-icon">👥</span>
                                                <span>{event.capacity.currentVolunteers}/{event.capacity.maxVolunteers}</span>
                                            </div>
                                            <div className="event-meta-item">
                                                <span className="meta-icon">🏷️</span>
                                                <span>{event.categoryName}</span>
                                            </div>
                                        </div>
                                        <div className="event-footer">
                                            <span className="organizer">By {event.organizerName}</span>
                                            <button className="btn-view-detail">Xem chi tiết →</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Roles Section */}
                <section className="roles-section" id="roles">
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">Dùng thử các vai trò</h2>
                            <p className="section-subtitle">
                                Choose your role and explore the platform features designed for you.
                            </p>
                        </div>
                        <div className="roles-grid">
                            <div className="role-card">
                                <div className="role-icon">💙</div>
                                <h3 className="role-title">Tình nguyện viên</h3>
                                <p className="role-description">Tham gia các hoạt động thiện nguyện</p>
                                <button className="btn-role" onClick={() => navigate('/login')}>
                                    Đăng nhập
                                </button>
                            </div>
                            <div className="role-card">
                                <div className="role-icon">👥</div>
                                <h3 className="role-title">Quản lý sự kiện</h3>
                                <p className="role-description">Tổ chức và quản lý các hoạt động</p>
                                <button className="btn-role" onClick={() => window.location.href = 'http://localhost:5173/manager/login'}>
                                    Đăng nhập
                                </button>
                            </div>
                            <div className="role-card">
                                <div className="role-icon">🎖️</div>
                                <h3 className="role-title">Quản trị viên</h3>
                                <p className="role-description">Quản lý toàn bộ hệ thống</p>
                                <button className="btn-role" onClick={() => window.location.href = 'http://localhost:5173/admin/login'}>
                                    Đăng nhập
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section" id="features">
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">Everything you need to succeed</h2>
                            <p className="section-subtitle">
                                Powerful features designed to help you create memorable impact and grow your community.
                            </p>
                        </div>
                        <div className="features-grid">
                            {features.map((feature) => (
                                <div key={feature.title} className="feature-card">
                                    <div className="feature-icon">{feature.icon}</div>
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p className="feature-description">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="footer">
                    <p>© 2023 VolunteerHub. All rights reserved.</p>
                </footer>
            </div>

            <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .home-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          min-height: 100vh;
          width: 100vw;
          background-color: #f8f9fa;
          color: #1a1a1a;
        }

        .navbar {
          width: 100%;
          background-color: #ffffff;
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

        .mobile-menu-btn {
          display: none;
          font-size: 28px;
          background: none;
          border: none;
          cursor: pointer;
          color: #1a1a1a;
          padding: 8px;
        }

        .nav-links {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .nav-link {
          text-decoration: none;
          color: #5a5a5a;
          font-size: 15px;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .nav-link:hover {
          background-color: #f0f0f0;
          color: #1a1a1a;
        }

        .btn-signin {
          color: #007bff;
          background: none;
          border: none;
          padding: 8px 16px;
          font-size: 15px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-signin:hover {
          background-color: #e7f3ff;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background-color: #0056b3;
          transform: translateY(-1px);
        }

        .hero-section {
          width: 100%;
          min-height: 550px;
          background: linear-gradient(135deg, rgba(212, 221, 232, 0.8), rgba(0, 123, 255, 0.1)),
                      url('https://media.istockphoto.com/id/2155998573/vi/anh/t%E1%BB%95-ch%E1%BB%A9c-t%E1%BB%AB-thi%E1%BB%87n-n%C4%83m-cao-v%C3%A0-%C4%91%E1%BB%99i-t%C3%ACnh-nguy%E1%BB%87n-trong-c%C3%B4ng-vi%C3%AAn-v%E1%BB%9Bi-b%C6%B0u-ki%E1%BB%87n-%C4%91%E1%BB%83-quy%C3%AAn-g%C3%B3p-ph%C3%A2n-ph%E1%BB%91i.jpg?s=2048x2048&w=is&k=20&c=jtpaWPdMpFO9cqMV1ZL-VrVyS4F_cpgnd4NE-X489Cw=');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          backdropFilter: 'blur(8px)', 
          WebkitBackdropFilter: 'blur(8px)',
        }

        .hero-content {
          max-width: 800px;
          text-align: center;
        }

        .hero-title {
          font-size: 56px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .hero-brand {
          color: #007bff;
        }

        .hero-subtitle {
          font-size: 20px;
          color: #5a5a5a;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-hero-primary,
        .btn-hero-secondary {
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-hero-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-hero-primary:hover {
          background-color: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .btn-hero-secondary {
          background-color: white;
          color: #007bff;
          border: 2px solid #007bff;
        }

        .btn-hero-secondary:hover {
          background-color: #007bff;
          color: white;
        }

        .stats-section {
          width: 100%;
          background-color: white;
          border-top: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
          padding: 60px 24px;
        }

        .stats-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 48px;
        }

        .stat-box {
          text-align: center;
        }

        .stat-number {
          font-size: 48px;
          font-weight: 700;
          color: #007bff;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 16px;
          color: #5a5a5a;
        }

        .section-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .section-title {
          font-size: 40px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #1a1a1a;
        }

        .section-subtitle {
          font-size: 18px;
          color: #5a5a5a;
          max-width: 700px;
          margin: 0 auto;
        }

        .events-section {
          width: 100%;
          padding: 80px 0;
          background-color: #f8f9fa;
        }

        .loading-state {
          text-align: center;
          padding: 60px 24px;
          font-size: 18px;
          color: #5a5a5a;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .event-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }

        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .event-badge {
          display: inline-block;
          font-size: 13px;
          font-weight: 600;
          color: #007bff;
          background-color: #e7f3ff;
          padding: 6px 12px;
          border-radius: 6px;
          margin-bottom: 16px;
          align-self: flex-start;
        }

        .event-title {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .event-description {
          font-size: 15px;
          color: #5a5a5a;
          line-height: 1.6;
          margin-bottom: 16px;
          flex: 1;
        }

        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .event-meta-item {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #5a5a5a;
        }

        .meta-icon {
          margin-right: 8px;
        }

        .event-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }

        .organizer {
          font-size: 14px;
          color: #5a5a5a;
        }

        .btn-view-detail {
          background: none;
          border: none;
          color: #007bff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-view-detail:hover {
          color: #0056b3;
        }

        .roles-section {
          width: 100%;
          padding: 80px 0;
          background-color: white;
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }

        .role-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          transition: all 0.3s;
        }

        .role-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .role-icon {
          font-size: 56px;
          margin-bottom: 20px;
        }

        .role-title {
          font-size: 22px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .role-description {
          font-size: 16px;
          color: #5a5a5a;
          margin-bottom: 24px;
        }

        .btn-role {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 12px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        .btn-role:hover {
          background-color: #0056b3;
          transform: translateY(-2px);
        }

        .features-section {
          width: 100%;
          padding: 80px 0;
          background-color: #f8f9fa;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }

        .feature-card {
          background: white;
          border-radius: 12px;
          padding: 32px;
          transition: all 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          font-size: 40px;
          margin-bottom: 16px;
        }

        .feature-title {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .feature-description {
          font-size: 15px;
          color: #5a5a5a;
          line-height: 1.6;
        }

        .footer {
          width: 100%;
          text-align: center;
          padding: 32px 24px;
          background-color: white;
          border-top: 1px solid #e0e0e0;
          color: #5a5a5a;
        }

        @media (max-width: 1024px) {
          .hero-title {
            font-size: 44px;
          }

          .section-title {
            font-size: 36px;
          }

          .events-grid,
          .features-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }

          .roles-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }

          .nav-links {
            position: fixed;
            top: 64px;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
          }

          .nav-links.mobile-open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .nav-link,
          .btn-signin {
            width: 100%;
            text-align: left;
            padding: 12px 16px;
          }

          .btn-primary {
            width: 100%;
          }

          .hero-section {
            min-height: 450px;
            padding: 40px 20px;
          }

          .hero-title {
            font-size: 32px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .hero-buttons {
            flex-direction: column;
            width: 100%;
          }

          .btn-hero-primary,
          .btn-hero-secondary {
            width: 100%;
          }

          .section-title {
            font-size: 28px;
          }

          .section-subtitle {
            font-size: 16px;
          }

          .stats-container {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .stat-number {
            font-size: 40px;
          }

          .events-grid,
          .roles-grid,
          .features-grid {
            grid-template-columns: 1fr;
          }

          .event-card,
          .role-card,
          .feature-card {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .nav-content {
            padding: 12px 16px;
          }

          .nav-brand {
            font-size: 20px;
          }

          .hero-title {
            font-size: 28px;
          }

          .hero-subtitle {
            font-size: 15px;
          }

          .section-title {
            font-size: 24px;
          }

          .stat-number {
            font-size: 36px;
          }

          .event-title,
          .feature-title,
          .role-title {
            font-size: 18px;
          }
        }
      `}</style>
        </>
    );
};

export default Home;