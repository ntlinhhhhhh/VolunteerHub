import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaInfoCircle, FaClock, FaTag, FaCheckCircle, FaUserCircle } from 'react-icons/fa';

const COLORS = {
    PRIMARY: '#1A73E8', 
    DARK_NAVY: '#202124', 
    CARD_BG: '#FFFFFF', 
    BORDER: '#EBEBEB', 
    TEXT_SECONDARY: '#5F6368', 
    DANGER: '#EA4335', 
};

interface DetailedEvent {
    id: string;
    title: string;
    description: string;
    organizerName: string;
    organizerEmail: string;
    categoryName: string;
    eventDate: string; 
    location: string;
    capacity: number;
    requirements: string;
    status: string;
    createdAt: string;
}

interface EventDetailSidePanelProps {
    eventId: string | null;
    onClose: () => void;
}

interface IconProps {
    size?: number;
    style?: React.CSSProperties;
}

const Item: React.FC<{ 
    icon: React.ReactElement<IconProps>, 
    label: string, 
    value: string | number 
}> = ({ icon, label, value }) => (
    <div style={panelStyles.detailItem}>
        {React.cloneElement(icon, { size: 14, style: panelStyles.icon as React.CSSProperties })}
        <span style={panelStyles.label}>{label}</span>
        <span style={panelStyles.value}>{value}</span>
    </div>
);


const EventDetailSidePanel: React.FC<EventDetailSidePanelProps> = ({ eventId, onClose }) => {
    const [eventDetail, setEventDetail] = useState<DetailedEvent | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEventDetails = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`http://localhost:8000/events/${id}`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
            });

            if (!res.ok) {
                const errorResult = await res.json().catch(() => ({ message: res.statusText }));
                setError(`Failed to fetch event details: ${errorResult.message}`);
                setEventDetail(null);
                return;
            }

            const result = await res.json();
            if (result.success && result.data) {
                const event = result.data;
                
                const detail: DetailedEvent = {
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    organizerName: event.organizerName || event.organizer?.name || 'Unknown Organizer',
                    organizerEmail: event.organizerEmail || event.organizer?.email || 'N/A',
                    categoryName: event.categoryName || 'N/A',
                    capacity: event.capacity?.max || 0,
                    requirements: event.requirements?.description || 'No specific requirements.',
                    status: event.status || 'N/A',
                    eventDate: event.schedule?.startDate ? new Date(event.schedule.startDate).toLocaleDateString('vi-VN') : 'N/A',
                    location: event.location?.address || 'Online',
                    createdAt: new Date(event.createdAt).toLocaleString('vi-VN'),
                };
                setEventDetail(detail);
            } else {
                setError(result.message || "Event data not found.");
            }
        } catch (err) {
            console.error("Network error fetching details.", err);
            setError("Network error fetching event details.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (eventId) {
            fetchEventDetails(eventId);
        }
    }, [eventId, fetchEventDetails]);

    if (!eventId) return null; 

    return (
        <div style={panelStyles.sidePanel}>
            <div style={panelStyles.header}>
                <h3 style={panelStyles.title}>
                    <FaInfoCircle style={{ marginRight: '10px', color: COLORS.PRIMARY }} />
                    Event Details
                </h3>
                <button onClick={onClose} style={panelStyles.closeButton} title="Close Panel">
                    <FaTimes size={18} />
                </button>
            </div>
            
            {loading && <p style={panelStyles.loadingText}>Loading event details...</p>}
            {error && <p style={panelStyles.errorText}>{error}</p>}

            {eventDetail && !loading && (
                <div style={panelStyles.content}>
                    <h2 style={panelStyles.eventTitle}>{eventDetail.title}</h2>
                    
                    <div style={panelStyles.detailItem}>
                        <FaClock style={panelStyles.icon} />
                        <span style={panelStyles.label}>Submitted:</span>
                        <span>{eventDetail.createdAt}</span>
                    </div>

                    <div style={panelStyles.section}>
                        <h4 style={panelStyles.sectionTitle}>Key Information</h4>
                        <Item icon={<FaCalendarAlt />} label="Date:" value={eventDetail.eventDate} />
                        <Item icon={<FaMapMarkerAlt />} label="Location:" value={eventDetail.location} />
                        <Item icon={<FaTag />} label="Category:" value={eventDetail.categoryName} />
                        <Item icon={<FaUsers />} label="Capacity:" value={`${eventDetail.capacity} volunteers`} />
                    </div>

                    <div style={panelStyles.section}>
                        <h4 style={panelStyles.sectionTitle}>Organizer Info</h4>
                        <Item icon={<FaUserCircle />} label="Name:" value={eventDetail.organizerName} />
                        <Item icon={<FaCheckCircle />} label="Email:" value={eventDetail.organizerEmail} />
                    </div>

                    <div style={panelStyles.section}>
                        <h4 style={panelStyles.sectionTitle}>Description</h4>
                        <p style={panelStyles.descriptionText}>{eventDetail.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


const panelStyles: { [key: string]: React.CSSProperties } = {
    sidePanel: {
        position: 'fixed',
        top: 0,
        right: 0,
        width: '350px',
        height: '100%',
        backgroundColor: COLORS.CARD_BG,
        boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.1)',
        zIndex: 900,
        transition: 'transform 0.3s ease-in-out',
        overflowY: 'auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 25px',
        borderBottom: `1px solid ${COLORS.BORDER}`,
        backgroundColor: '#F7F9FC',
    },
    title: {
        fontSize: '20px',
        fontWeight: '600',
        color: COLORS.DARK_NAVY,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: COLORS.TEXT_SECONDARY,
        padding: '5px',
        transition: 'color 0.2s',
        ...({ ':hover': { color: COLORS.DANGER } } as React.CSSProperties), // Sử dụng COLORS.DANGER khi hover
    },
    content: {
        padding: '25px',
    },
    eventTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: COLORS.PRIMARY,
        marginBottom: '20px',
    },
    section: {
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: `1px solid ${COLORS.BORDER}`,
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: COLORS.DARK_NAVY,
        marginBottom: '10px',
    },
    detailItem: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '10px',
        fontSize: '14px',
    },
    icon: {
        marginRight: '10px',
        color: COLORS.TEXT_SECONDARY,
        marginTop: '3px',
    },
    label: {
        fontWeight: '500',
        color: COLORS.DARK_NAVY,
        minWidth: '80px',
    },
    value: {
        color: COLORS.TEXT_SECONDARY,
        flexGrow: 1,
    },
    descriptionText: {
        fontSize: '14px',
        color: COLORS.TEXT_SECONDARY,
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
    },
    loadingText: {
        textAlign: 'center',
        padding: '20px',
        color: COLORS.TEXT_SECONDARY,
    },
    errorText: {
        textAlign: 'center',
        padding: '20px',
        color: 'red',
    }
};

export default EventDetailSidePanel;