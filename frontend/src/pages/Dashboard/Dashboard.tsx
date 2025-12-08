import React, { useEffect, useState } from "react";
import { FaCompass, FaChartBar, FaCalendarAlt, FaSearch, FaFilter, FaUser } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

// --- Dữ liệu mô phỏng sự kiện ---
interface Event {
    id: number;
    title: string;
    category: 'Technology' | 'Music' | 'Business' | 'Food' | 'Art';
    date: string;
    location: string;
    attendees: number;
    capacity: number;
    imageUrl: string;
}

const mockEvents: Event[] = [
    { id: 1, title: 'Tech Conference 2024', category: 'Technology', date: '2024-03-15', location: 'San Francisco, CA', attendees: 450, capacity: 500, imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600&h=400&ixlib=rb-4.0.3' },
    { id: 2, title: 'Summer Music Festival', category: 'Music', date: '2024-06-20', location: 'Austin, TX', attendees: 2600, capacity: 3000, imageUrl: 'https://images.unsplash.com/photo-1514525253161-ec8542fe8263?auto=format&fit=crop&q=80&w=600&h=400&ixlib=rb-4.0.3' },
    { id: 3, title: 'Marketing Workshop', category: 'Business', date: '2024-02-10', location: 'New York, NY', attendees: 129, capacity: 150, imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600&h=400&ixlib=rb-4.0.3' },
    { id: 4, title: 'Food & Wine Expo', category: 'Food', date: '2024-04-05', location: 'Chicago, IL', attendees: 680, capacity: 800, imageUrl: 'https://images.unsplash.com/photo-1550547660-d94b8cd9a9c5?auto=format&fit=crop&q=80&w=600&h=400&ixlib=rb-4.0.3' },
];

// --- Component Thẻ Sự Kiện ---
const EventCard: React.FC<{ event: Event }> = ({ event }) => {
    const availabilityPercent = Math.round((event.attendees / event.capacity) * 100);
    return (
        <div style={styles.eventCard}>
            <div style={{ ...styles.eventImageWrapper, backgroundImage: `url(${event.imageUrl})` }}>
                <span style={styles.eventCategoryTag}>{event.category}</span>
            </div>
            <div style={styles.eventCardContent}>
                <h3 style={styles.eventCardTitle}>{event.title}</h3>
                <div style={styles.eventCardMeta}>
                    <p style={styles.eventMetaItem}><FaCalendarAlt style={{ marginRight: '5px' }} /> {event.date}</p>
                    <p style={styles.eventMetaItem}><FaCompass style={{ marginRight: '5px' }} /> {event.location}</p>
                    <p style={styles.eventMetaItemSmall}>{event.attendees} / {event.capacity} attendees</p>
                </div>
                <div style={styles.progressBarContainer}>
                    <div style={styles.progressBarBack}>
                        <div style={{ ...styles.progressBarFill, width: `${availabilityPercent}%` }}></div>
                    </div>
                    <span style={styles.progressBarText}>Availability: {availabilityPercent}%</span>
                </div>
            </div>
        </div>
    );
};

// --- Component Chính Dashboard ---
const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    // Thêm trạng thái 'profile' vào activeSection
    const [activeSection, setActiveSection] = useState<'overview' | 'browse' | 'insights' | 'profile'>('browse');
    const [user, setUser] = useState<any>(null);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        // Giả lập dữ liệu user để hiển thị ngay (bạn có thể bỏ comment fetch để chạy thật)
        // setUser({ 
        //     email: "zmint2254@gmail.com", 
        //     fullName: "ZM", 
        //     username: "zm", 
        //     phoneNumber: "0123456789",
        //     bio: "Volunteer enthusiast",
        //     avatar: "https://i.imgur.com/NGVz6NU.png"
        // });

        // Code fetch cũ của bạn giữ nguyên nếu cần
        if (!token) return;
        fetch("http://localhost:8000/users/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch((err) => console.error(err));
        
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div style={styles.dashboardContainer}>
            {/* --- SIDEBAR (Giữ nguyên) --- */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarTitle}>VolunteerHub</div>
                <div style={styles.sidebarSubtitle}>Event Management</div>
                
                <div style={styles.navItemContainer}>
                    <div style={{ ...styles.navItem, ...(activeSection === 'overview' ? styles.navItemSelected : {}) }} onClick={() => setActiveSection('overview')}>
                        <FaCompass style={styles.navIcon} /> Overview
                    </div>
                    <div style={{ ...styles.navItem, ...(activeSection === 'browse' ? styles.navItemSelected : {}) }} onClick={() => setActiveSection('browse')}>
                        <FaCalendarAlt style={styles.navIcon} /> Browse Events
                    </div>
                    <div style={{ ...styles.navItem, ...(activeSection === 'insights' ? styles.navItemSelected : {}) }} onClick={() => setActiveSection('insights')}>
                        <FaChartBar style={styles.navIcon} /> Attendee Insights
                    </div>
                    {/* Thêm mục Profile vào sidebar để dễ click */}
                    <div style={{ ...styles.navItem, ...(activeSection === 'profile' ? styles.navItemSelected : {}) }} onClick={() => setActiveSection('profile')}>
                        <FaUser style={styles.navIcon} /> My Profile
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div style={styles.contentMain}>
                {/* Top Bar */}
                <div style={styles.topBar}>
                    <div></div> {/* Spacer */}
                    {user && (
                        <div style={styles.userBox} onClick={() => setShowMenu(!showMenu)}>
                            <img src={user.avatar} alt="avatar" style={styles.avatar} />
                            <span style={styles.userName}>{user.email}</span>
                            {showMenu && (
                                <div style={styles.dropdown}>
                                    <div style={styles.dropdownItem} onClick={() => setActiveSection("profile")}>Profile</div>
                                    <div style={styles.dropdownItem} onClick={handleLogout}>Logout</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- Nội dung thay đổi dựa trên activeSection --- */}

                {/* SECTION: BROWSE EVENTS */}
                {activeSection === 'browse' && (
                    <>
                        <h1 style={styles.contentTitle}>Browse Events</h1>
                        <p style={styles.contentSubtitle}>Discover volunteering events you love</p>
                        
                        <div style={styles.searchBarWrapper}>
                            <div style={styles.searchInputGroup}>
                                <FaSearch style={styles.searchIcon} />
                                <input type="text" placeholder="Search events..." style={styles.searchInput} />
                            </div>
                            <button style={styles.filterButton}>
                                <FaFilter style={{ marginRight: '8px' }} /> Filters
                            </button>
                        </div>

                        <div style={styles.eventGrid}>
                            {mockEvents.map(event => <EventCard key={event.id} event={event} />)}
                        </div>
                    </>
                )}

                {/* SECTION: MY PROFILE (Nội dung bạn muốn thay thế) */}
                {activeSection === 'profile' && (
                    <div style={styles.profileContainer}>
                        <h1 style={styles.contentTitle}>My Profile</h1>
                        <p style={styles.contentSubtitle}>Manage your personal information</p>

                        <div style={styles.profileFormCard}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <input value={user?.email || ''} disabled style={{...styles.input, background: "#e9ecef"}} />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input defaultValue={user?.fullName || ''} style={styles.input} />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Username</label>
                                <input defaultValue={user?.username || ''} style={styles.input} />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone Number</label>
                                <input defaultValue={user?.phoneNumber || ''} style={styles.input} />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Bio</label>
                                <textarea defaultValue={user?.bio || ''} style={styles.textarea} />
                            </div>

                            <button style={styles.saveButton}>Save Changes</button>
                        </div>
                    </div>
                )}

                {/* Các section khác */}
                {activeSection === 'overview' && <div style={{padding: '20px'}}><h2>Overview Content</h2></div>}
                {activeSection === 'insights' && <div style={{padding: '20px'}}><h2>Insights Content</h2></div>}
            </div>
        </div>
    );
};

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    dashboardContainer: {
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f8f9fa',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", // Font đẹp hơn chút
        overflow: 'hidden',
    },
    
    // Sidebar
    sidebar: {
        width: '260px',
        minWidth: '260px',
        backgroundColor: 'white',
        padding: '30px 0',
        borderRight: '1px solid #e9ecef',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
    },
    sidebarTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#343a40',
        padding: '0 30px',
        marginBottom: '5px',
    },
    sidebarSubtitle: {
        fontSize: '14px',
        color: '#adb5bd',
        marginBottom: '40px',
        padding: '0 30px',
    },
    navItemContainer: { padding: '0' },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '14px 30px',
        cursor: 'pointer',
        color: '#495057',
        fontSize: '15px',
        fontWeight: '500',
        transition: 'all 0.2s',
        marginBottom: '2px',
        borderLeft: '4px solid transparent', // Để hiệu ứng hover đẹp hơn
    },
    navItemSelected: {
        backgroundColor: '#f0f7ff',
        color: '#007bff',
        fontWeight: '600',
        borderLeft: '4px solid #007bff',
        borderRight: 'none', // Override style cũ
    },
    navIcon: { marginRight: '12px', fontSize: '18px' },

    // Content
    contentMain: {
        flexGrow: 1,
        padding: '30px 40px',
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: '#f8f9fa',
        boxSizing: 'border-box',
    },
    topBar: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 30,
        height: '50px',
        alignItems: 'center',
    },
    userBox: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "6px 12px",
        background: "white",
        border: "1px solid #e9ecef",
        borderRadius: 20,
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
        transition: "0.2s",
    },
    avatar: { width: 32, height: 32, borderRadius: "50%", objectFit: "cover" },
    userName: { fontSize: 14, color: "#343a40", fontWeight: '500' },
    
    dropdown: {
        position: "absolute",
        top: "50px",
        right: "0",
        backgroundColor: "white",
        color: "#333",
        padding: "5px",
        borderRadius: "8px",
        minWidth: "140px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        zIndex: 999,
        border: '1px solid #f0f0f0',
    },
    dropdownItem: {
        padding: "10px 15px",
        cursor: "pointer",
        color: "#333",
        fontSize: "14px",
        borderRadius: "6px",
        transition: "0.2s",
    },

    contentTitle: { fontSize: '28px', fontWeight: '700', color: '#343a40', marginBottom: '8px', marginTop: 0 },
    contentSubtitle: { fontSize: '16px', color: '#6c757d', marginBottom: '30px', marginTop: 0 },

    // Search Styles
    searchBarWrapper: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    searchInputGroup: { display: 'flex', alignItems: 'center', border: '1px solid #e9ecef', borderRadius: '10px', padding: '10px 15px', backgroundColor: 'white', flexGrow: 1, marginRight: '20px', maxWidth: '450px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
    searchIcon: { color: '#adb5bd', marginRight: '10px' },
    searchInput: { border: 'none', outline: 'none', fontSize: '15px', width: '100%', backgroundColor: 'transparent', color: '#495057' },
    filterButton: { display: 'flex', alignItems: 'center', padding: '10px 20px', backgroundColor: 'white', color: '#495057', border: '1px solid #e9ecef', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },

    // Event Grid
    eventGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', paddingBottom: '40px' },
    eventCard: { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer', border: '1px solid #f0f0f0' },
    eventImageWrapper: { height: '160px', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', justifyContent: 'flex-end', padding: '15px' },
    eventCategoryTag: { backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', alignSelf: 'flex-start' },
    eventCardContent: { padding: '20px' },
    eventCardTitle: { fontSize: '17px', fontWeight: '700', marginBottom: '10px', color: '#343a40', lineHeight: 1.4 },
    eventCardMeta: { marginBottom: '15px' },
    eventMetaItem: { display: 'flex', alignItems: 'center', marginBottom: '6px', fontSize: '13px', color: '#6c757d' },
    eventMetaItemSmall: { marginTop: '8px', fontSize: '12px', color: '#adb5bd', fontWeight: '500' },
    progressBarContainer: { marginTop: '15px' },
    progressBarBack: { height: '6px', backgroundColor: '#e9ecef', borderRadius: '3px', overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#007bff', borderRadius: '3px' },
    progressBarText: { fontSize: '12px', color: '#adb5bd', marginTop: '6px', display: 'block', textAlign: 'right' },

    // --- PROFILE STYLES (Mới thêm) ---
    profileContainer: {
        maxWidth: '800px', // Giới hạn chiều rộng cho đẹp
        paddingBottom: '50px',
    },
    profileFormCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        border: '1px solid #f0f0f0',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#495057',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '15px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        backgroundColor: '#fff',
        color: '#212529',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box', // Quan trọng để không bị tràn
    },
    textarea: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '15px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        backgroundColor: '#fff',
        color: '#212529',
        outline: 'none',
        minHeight: '120px',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box',
    },
    saveButton: {
        backgroundColor: '#000', // Giữ màu đen theo thiết kế cũ của bạn
        color: 'white',
        padding: '14px 24px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '10px',
        width: '100%',
        transition: 'background-color 0.2s',
    },
};

export default Dashboard;