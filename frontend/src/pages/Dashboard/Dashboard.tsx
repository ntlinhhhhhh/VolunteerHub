import React, { useState } from "react";
import { FaCompass, FaChartBar, FaCalendarAlt, FaSearch, FaFilter } from 'react-icons/fa';

// Dữ liệu mô phỏng sự kiện (Event Data)
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
    { id: 5, title: 'Startup Pitch Night', category: 'Business', date: '2024-03-28', location: 'Seattle, WA', attendees: 200, capacity: 250, imageUrl: 'https://images.unsplash.com/photo-1556742512-581d770c679a?auto=format&fit=crop&q=80&w=600&h=400&ixlib=rb-4.0.3' },
    { id: 6, title: 'Art Gallery Opening', category: 'Art', date: '2024-05-02', location: 'Los Angeles, CA', attendees: 350, capacity: 400, imageUrl: 'https://images.unsplash.com/photo-1574706950275-c081e626e95a?auto=format&fit=crop&q=80&w=600&h=400&ixlib=rb-4.0.3' },
];

// Component hiển thị thẻ sự kiện
const EventCard: React.FC<{ event: Event }> = ({ event }) => {
    const availabilityPercent = Math.round((event.attendees / event.capacity) * 100);

    // Style cho thanh tiến độ
    const progressBarStyle = {
        height: '8px',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        marginTop: '8px',
        overflow: 'hidden',
    } as React.CSSProperties;

    const progressBarFillStyle = {
        width: `${availabilityPercent}%`,
        height: '100%',
        backgroundColor: '#007bff',
        borderRadius: '4px',
    } as React.CSSProperties;

    return (
        <div style={styles.eventCard}>
            <div style={{ ...styles.eventImageWrapper, backgroundImage: `url(${event.imageUrl})` }}>
                <span style={styles.eventCategoryTag}>{event.category}</span>
            </div>
            <div style={styles.eventCardContent}>
                <h3 style={styles.eventCardTitle}>{event.title}</h3>
                
                <div style={styles.eventCardMeta}>
                    <p style={styles.eventMetaItem}>
                        <FaCalendarAlt style={{ marginRight: '5px' }} /> {event.date}
                    </p>
                    <p style={styles.eventMetaItem}>
                        <FaCompass style={{ marginRight: '5px' }} /> {event.location}
                    </p>
                    <p style={styles.eventMetaItemSmall}>
                        {event.attendees} / {event.capacity} attendees
                    </p>
                </div>

                <div style={styles.progressBarContainer}>
                    <div style={progressBarStyle}>
                        <div style={progressBarFillStyle}></div>
                    </div>
                    <span style={styles.progressBarText}>Availability: {availabilityPercent}%</span>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    // State để mô phỏng chọn mục sidebar
    const [activeSection, setActiveSection] = useState<'overview' | 'browse' | 'insights'>('browse');

    return (
        <div style={styles.dashboardContainer}>
            {/* --- Sidebar --- */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarTitle}>VolunteerHub</div>
                <div style={styles.sidebarSubtitle}>Event Management</div>
                
                <div style={styles.navItemContainer}>
                    <div 
                        style={{ ...styles.navItem, ...(activeSection === 'overview' ? styles.navItemSelected : {}) }}
                        onClick={() => setActiveSection('overview')}
                    >
                        <FaCompass style={styles.navIcon} /> Overview
                    </div>
                    <div 
                        style={{ ...styles.navItem, ...(activeSection === 'browse' ? styles.navItemSelected : {}) }}
                        onClick={() => setActiveSection('browse')}
                    >
                        <FaCalendarAlt style={styles.navIcon} /> Browse Events
                    </div>
                    <div 
                        style={{ ...styles.navItem, ...(activeSection === 'insights' ? styles.navItemSelected : {}) }}
                        onClick={() => setActiveSection('insights')}
                    >
                        <FaChartBar style={styles.navIcon} /> Attendee Insights
                    </div>
                </div>
            </div>

            {/* --- Content Main --- */}
            <div style={styles.contentMain}>
                <h1 style={styles.contentTitle}>Browse Events</h1>
                <p style={styles.contentSubtitle}>Discover volunteering events you love</p>
                
                {/* Search and Filters */}
                <div style={styles.searchBarWrapper}>
                    <div style={styles.searchInputGroup}>
                        <FaSearch style={styles.searchIcon} />
                        <input type="text" placeholder="Search events..." style={styles.searchInput} />
                    </div>
                    <button style={styles.filterButton}>
                        <FaFilter style={{ marginRight: '8px' }} /> Filters
                    </button>
                </div>

                {/* Event Grid */}
                {activeSection === 'browse' && (
                    <div style={styles.eventGrid}>
                        {mockEvents.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}

                {/* Placeholder for other sections */}
                {activeSection === 'overview' && <div style={{padding: '50px'}}><h2>Overview Content Here</h2></div>}
                {activeSection === 'insights' && <div style={{padding: '50px'}}><h2>Attendee Insights Content Here</h2></div>}
            </div>
        </div>
    );
};

// --- Styling ---
const styles: { [key: string]: React.CSSProperties } = {
    dashboardContainer: {
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
    },
    
    // --- Sidebar Styles ---
    sidebar: {
        width: '250px',
        minWidth: '250px',
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
    },
    sidebarSubtitle: {
        fontSize: '14px',
        color: '#adb5bd',
        marginBottom: '40px',
        padding: '0 30px',
    },
    navItemContainer: {
        padding: '0 0px',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 30px',
        cursor: 'pointer',
        color: '#495057',
        fontSize: '15px',
        transition: 'background-color 0.2s, color 0.2s',
        marginBottom: '5px',
    },
    navItemSelected: {
        backgroundColor: '#e6f0ff',
        color: '#007bff',
        fontWeight: 'bold',
        borderRight: '3px solid #007bff',
    },
    navIcon: {
        marginRight: '10px',
        fontSize: '18px',
    },

    // --- Content Main Styles ---
    contentMain: {
        flexGrow: 1,
        padding: '30px 40px',
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: '#f8f9fa',
    },
    contentTitle: {
        fontSize: '28px',
        fontWeight: '600',
        color: '#343a40',
        marginBottom: '5px',
    },
    contentSubtitle: {
        fontSize: '16px',
        color: '#6c757d',
        marginBottom: '30px',
    },
    
    // Search and Filter
    searchBarWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        maxWidth: '100%',
    },
    searchInputGroup: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #ced4da',
        borderRadius: '8px',
        padding: '8px 12px',
        backgroundColor: 'white',
        flexGrow: 1,
        marginRight: '15px',
        maxWidth: '400px',
    },
    searchIcon: {
        color: '#adb5bd',
        marginRight: '10px',
    },
    searchInput: {
        border: 'none',
        outline: 'none',
        fontSize: '16px',
        width: '100%',
        backgroundColor: 'transparent',
        color: '#343a40',
    },
    filterButton: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: 'white',
        color: '#343a40',
        border: '1px solid #ced4da',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: 'bold',
    },

    // --- Event Grid and Card Styles ---
    eventGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '30px',
        paddingBottom: '40px',
    },
    eventCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        cursor: 'pointer',
    },
    eventImageWrapper: {
        height: '180px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '10px',
    },
    eventCategoryTag: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        alignSelf: 'flex-start',
    },
    eventCardContent: {
        padding: '20px',
    },
    eventCardTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#343a40',
    },
    eventCardMeta: {
        fontSize: '14px',
        color: '#6c757d',
        marginBottom: '10px',
    },
    eventMetaItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '5px',
        lineHeight: '1.2',
    },
    eventMetaItemSmall: {
        marginTop: '10px',
        fontSize: '13px',
    },
    progressBarContainer: {
        marginTop: '15px',
    },
    progressBarText: {
        fontSize: '12px',
        color: '#6c757d',
        marginTop: '5px',
        display: 'block',
    },
};

export default Dashboard;