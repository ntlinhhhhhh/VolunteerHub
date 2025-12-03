import React from 'react';
import { useNavigate } from 'react-router-dom';

// Define the content for the features section
interface Feature {
  icon: string; // Using emojis as icons for simplicity
  title: string;
  description: string;
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

  return (
    <div style={styles.container}>
      {/* --- Navigation Bar --- */}
      <nav style={styles.navbar}>
        {/* Wrapper mới để căn giữa và tạo padding (thụt lề) */}
        <div style={styles.navContentWrapper}> 
          <div style={styles.navBrand}>
            Volunteer<span style={{ color: '#007bff', fontWeight: 'bold' }}>Hub</span>
          </div>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#about" style={styles.navLink}>About</a>
            <a href="#impact" style={styles.navLink}>Impact</a>
            <a style={styles.loginButton} onClick={() => navigate('/login')}>Sign In</a>
            <a style={styles.registerButton} onClick={() => navigate('/register')}>Get Started</a>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header style={styles.heroSection}>
        <h1 style={styles.heroTitle}>
          Welcome to <span style={styles.heroBrand}>VolunteerHub</span>
        </h1>
        <p style={styles.heroSubtitle}>
          The all-in-one platform for managing volunteers, tracking service hours, and amplifying your impact.
        </p>
        <div style={styles.heroButtons}>
          <button style={styles.primaryButton} onClick={() => navigate('/register')}>
            Join as a Volunteer
          </button>
          <button style={styles.secondaryButton} onClick={() => navigate('/login')}>
            Manage My Account
          </button>
        </div>
      </header>
      

      {/* --- Stats Section --- */}
      <section style={styles.statsSection} id="impact">
        <div style={styles.statBox}>
          <div style={styles.statNumber}>100K+</div>
          <div style={styles.statLabel}>Service Hours Tracked</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statNumber}>500+</div>
          <div style={styles.statLabel}>Active Organizations</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statNumber}>99.9%</div>
          <div style={styles.statLabel}>Volunteer Satisfaction</div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section style={styles.featuresSection} id="features">
        <h2 style={styles.sectionTitle}>Everything you need to succeed</h2>
        <p style={styles.sectionSubtitle}>Powerful features designed to help you create memorable impact and grow your community.</p>
        <div style={styles.featuresGrid}>
          {features.map((feature) => (
            <div key={feature.title} style={styles.featureCard}>
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Footer or simply end-content --- */}
      <footer style={styles.footer}>
        <p>© 2023 VolunteerHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

const HERO_IMAGE_URL = "https://media.istockphoto.com/id/2155998573/vi/anh/t%E1%BB%95-ch%E1%BB%A9c-t%E1%BB%AB-thi%E1%BB%87n-n%C4%83m-cao-v%C3%A0-%C4%91%E1%BB%99i-t%C3%ACnh-nguy%E1%BB%87n-trong-c%C3%B4ng-vi%C3%AAn-v%E1%BB%9Bi-b%C6%B0u-ki%E1%BB%87n-%C4%91%E1%BB%83-quy%C3%AAn-g%C3%B3p-ph%C3%A2n-ph%E1%BB%91i.jpg?s=2048x2048&w=is&k=20&c=jtpaWPdMpFO9cqMV1ZL-VrVyS4F_cpgnd4NE-X489Cw=";
// --- Styling (for a clean desktop-like layout) ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Light background
    color: '#343a40',
  },
  // Navbar
  navbar: {
    width: '100%',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    padding: '20px 0', // Padding top/bottom, 0 left/right
  },
  // Wrapper mới cho nội dung navbar để giới hạn chiều rộng và căn giữa
  navContentWrapper: {
    width: '100%',
    maxWidth: '1300px', // Giới hạn chiều rộng tối đa (giả sử màn hình lớn)
    margin: '0 auto',   // Căn giữa
    padding: '0 40px', // Padding ngang (thụt lề)
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBrand: {
    fontSize: '24px',
    fontWeight: '300',
  },
  navLinks: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  navLink: {
    textDecoration: 'none',
    color: '#343a40',
    fontSize: '16px',
    padding: '5px 10px',
  },
  loginButton: {
    cursor: 'pointer',
    color: '#007bff',
    textDecoration: 'none',
    padding: '5px 10px',
    fontSize: '16px',
  },
  registerButton: {
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '4px',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: '16px',
    border: 'none',
  },

  // Hero Section
  heroSection: {
    minHeight: '60vh',
    textAlign: 'center',
    padding: '80px 20px',
    width: '100%', 
    margin: '0', 

    justifyContent: 'center',
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 

    backgroundImage: `linear-gradient(rgba(240, 244, 248, 0.6), rgba(240, 244, 248, 0.8)), url(${HERO_IMAGE_URL})`,
    backgroundSize: 'cover', 
    backgroundPosition: 'center', 
    backgroundAttachment: 'fixed', 
},
  heroTitle: {
    fontSize: '48px',
    fontWeight: '300',
    marginBottom: '10px',
  },
  heroBrand: {
    color: '#007bff',
    fontWeight: '600',
  },
  heroSubtitle: {
    fontSize: '20px',
    color: '#6c757d',
    marginBottom: '30px',
  },
  heroButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
  },
  primaryButton: {
    padding: '12px 30px',
    fontSize: '18px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '12px 30px',
    fontSize: '18px',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '2px solid #007bff',
    borderRadius: '6px',
    cursor: 'pointer',
  },

  // Stats Section
  statsSection: {
    width: '80%',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '50px 0',
    margin: '30px 0',
    borderTop: '1px solid #dee2e6',
    borderBottom: '1px solid #dee2e6',
  },
  statBox: {
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '40px',
    fontWeight: 'bold',
    color: '#343a40',
  },
  statLabel: {
    fontSize: '16px',
    color: '#6c757d',
  },

  // Features Section
  featuresSection: {
    width: '80%',
    padding: '80px 0',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '300',
    marginBottom: '10px',
  },
  sectionSubtitle: {
    fontSize: '18px',
    color: '#6c757d',
    marginBottom: '50px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '30px',
  },
  featureCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    textAlign: 'left',
  },
  featureIcon: {
    fontSize: '30px',
    marginBottom: '15px',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '10px',
  },
  featureDescription: {
    fontSize: '16px',
    color: '#6c757d',
  },

  // Footer
  footer: {
    width: '100%',
    textAlign: 'center',
    padding: '20px 0',
    borderTop: '1px solid #dee2e6',
    marginTop: '50px',
    color: '#6c757d',
  }
};

export default Home;