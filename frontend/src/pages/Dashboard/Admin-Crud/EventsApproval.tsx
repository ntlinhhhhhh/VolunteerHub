import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaUsers, FaCalendarAlt, FaFilter, FaSearch, FaChevronRight, FaSync, FaArrowAltCircleLeft, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock, FaClipboardList, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const COLORS = {
    PRIMARY: '#1A73E8', 
    SECONDARY: '#4285F4', 
    DARK_NAVY: '#202124', 
    BACKGROUND: '#F8F9FA', 
    CARD_BG: '#FFFFFF', 
    BORDER: '#EBEBEB', 
    SUCCESS_ACCENT: '#34A853', 
    DANGER: '#EA4335', 
    TEXT_SECONDARY: '#5F6368', 
    WHITE: '#FFFFFF',
    WARNING: '#F7B200', 
    INFO: '#4CB7A5', 
};

const EVENT_STATUS_COLORS: { [key: string]: string } = {
    'draft': COLORS.TEXT_SECONDARY,
    'pending_approval': COLORS.WARNING,
    'approved': COLORS.INFO,
    'published': COLORS.PRIMARY,
    'ongoing': COLORS.SECONDARY,
    'completed': COLORS.SUCCESS_ACCENT,
    'cancelled': COLORS.DANGER,
    'rejected': COLORS.DANGER,
};


interface DashboardStyles {
    [key: string]: React.CSSProperties;
}

interface PendingEvent {
    id: string;
    title: string;
    organizerName: string;
    createdAt: string;
    status: 'pending_approval' | 'approved' | 'rejected'; 
    eventDate: string; 
    location: string;
}

const EventsApproval: React.FC = () => {
    const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0); 

    const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    const fetchPendingEvents = useCallback(async (token: string) => {
        setLoading(true);
        setError(null); 
        try {
            const res = await fetch("http://localhost:8000/events/?status=pending_approval", {
                method: "GET",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorResult = await res.json().catch(() => ({ message: res.statusText }));
                setError(`Pending events failed: ${errorResult.message || res.statusText}`);
                setPendingEvents([]);
                return;
            }

            const result = await res.json();
            if (result.success) {
                
                let rawEvents = [];
                if (Array.isArray(result.data)) {
                    rawEvents = result.data;
                } else if (result.data && Array.isArray(result.data.events)) {
                    rawEvents = result.data.events;
                }
                
                const events: PendingEvent[] = rawEvents.map((event: any) => ({
                    id: event.id,
                    title: event.title,
                    organizerName: event.organizerName || event.organizer?.name || 'Unknown Organizer', 
                    createdAt: new Date(event.createdAt).toLocaleDateString('vi-VN'),
                    eventDate: event.schedule?.startDate ? new Date(event.schedule.startDate).toLocaleDateString('vi-VN') : 'N/A',
                    location: event.location?.address || event.location || 'Online',
                    status: (event.status as 'pending_approval') || 'pending_approval', 
                }));
                
                setPendingEvents(events);
                setError(null);
            } else {
                setError(result.message || "Failed to fetch pending events.");
                setPendingEvents([]);
            }
        } catch (err) {
            console.error("Network error fetching pending events.", err);
            setError("Network error fetching pending events.");
            setPendingEvents([]);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        const token = localStorage.getItem('accessToken'); 
        if (!token) { 
            setError("Token not found. Vui lòng đăng nhập lại."); 
            setLoading(false);
            return; 
        }
        fetchPendingEvents(token);
    }, [refreshKey, fetchPendingEvents]); 

    const handleApproveReject = async (eventId: string, action: 'approve' | 'reject') => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setActionMessage({ type: 'error', text: "Token not found. Please log in again." });
            return;
        }

        const confirmMessage = `Bạn có chắc chắn muốn ${action === 'approve' ? 'DUYỆT' : 'TỪ CHỐI'} sự kiện này (ID: ${eventId})?`;
        
        if (!window.confirm(confirmMessage)) {
            return;
        }
        
        const endpoint = `http://localhost:8000/events/${eventId}/${action}`;
        
        let reason: string | null | undefined;
        let body: any = {};
        
        if (action === 'reject') {
            reason = prompt("Vui lòng nhập lý do từ chối:");
            if (!reason || reason.trim() === '') {
                 setActionMessage({ type: 'error', text: "Phải có lý do từ chối." });
                 return;
            }
            body = { rejectionReason: reason };
        }

        setLoading(true);

        try {
            const res = await fetch(endpoint, {
                method: "POST", 
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(body),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                const message = action === 'approve' 
                    ? `✅ Sự kiện đã được DUYỆT thành công!` 
                    : `❌ Sự kiện đã bị TỪ CHỐI thành công!`;
                setActionMessage({ type: 'success', text: message });

                setPendingEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
                
            } else {
                setActionMessage({ 
                    type: 'error', 
                    text: `❌ Thao tác ${action} thất bại: ${result.message || res.statusText || 'Lỗi không xác định.'}` 
                });
            }
        } catch (err) {
            console.error(err);
            setActionMessage({ type: 'error', text: "❌ Lỗi mạng trong quá trình thay đổi trạng thái." });
        } finally {
            setLoading(false);
        }
    };
    
    const handleRefresh = useCallback(() => {
        setRefreshKey(prevKey => prevKey + 1);
        setLoading(true);
        setError(null); 
        setActionMessage(null); 
    }, []);

    useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => setActionMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [actionMessage]);


    const getActionMessageStyle = () => {
        if (!actionMessage) return {};
        if (actionMessage.type === 'success') return styles.actionSuccessMessage;
        if (actionMessage.type === 'error') return styles.actionErrorMessage;
        return {};
    }

    const filteredEvents = useMemo(() => {
        if (!searchTerm) return pendingEvents;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return pendingEvents.filter(event => 
            event.title.toLowerCase().includes(lowerCaseSearchTerm) ||
            event.organizerName.toLowerCase().includes(lowerCaseSearchTerm) ||
            event.location.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [pendingEvents, searchTerm]);

    
    const renderEventsApprovalTable = () => {
        if (loading && pendingEvents.length === 0) return <p style={{ textAlign: 'center', padding: '20px', color: COLORS.TEXT_SECONDARY }}>Loading events...</p>;
        if (error && pendingEvents.length === 0) return <p style={{ color: COLORS.DANGER, textAlign: 'center', padding: '20px' }}>Error fetching data: {error}</p>;
        
        if (filteredEvents.length === 0) {
            return (
                <div style={styles.emptyState}>
                    <FaCheckCircle size={50} style={{ color: COLORS.SUCCESS_ACCENT, marginBottom: '10px' }}/>
                    <p style={{ margin: 0 }}>
                        {searchTerm ? "No pending events match your search criteria." : "No events are currently pending approval. Good job!"}
                    </p>
                </div>
            );
        }

        return (
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, width: '35%'}}>Event Title</th>
                            <th style={{...styles.th, width: '15%'}}>Organizer</th>
                            <th style={{...styles.th, width: '15%'}}>Event Date & Location</th> 
                            <th style={{...styles.th, width: '15%'}}>Submitted On</th>
                            <th style={{...styles.th, width: '20%', textAlign: 'center'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEvents.map((event) => (
                            <tr key={event.id} style={styles.tr}>
                                <td style={styles.td}>{event.title}</td>
                                <td style={styles.td}>
                                    <span style={{fontWeight: '500'}}>{event.organizerName}</span>
                                </td>
                                <td style={styles.td}>
                                    <p style={{margin: '0', display: 'flex', alignItems: 'center'}}><FaCalendarAlt size={12} style={{marginRight: '5px', color: COLORS.TEXT_SECONDARY}}/>{event.eventDate}</p>
                                    <p style={{margin: '5px 0 0 0', display: 'flex', alignItems: 'center'}}><FaMapMarkerAlt size={12} style={{marginRight: '5px', color: COLORS.TEXT_SECONDARY}}/>{event.location}</p>
                                </td>
                                <td style={styles.td}>
                                    <FaClock size={12} style={{marginRight: '5px', color: COLORS.TEXT_SECONDARY}}/>{event.createdAt}
                                </td>
                                
                                <td style={{...styles.td, textAlign: 'center'}}>
                                    <div style={styles.actionButtonContainerVertical}>
                                        
                                        <button 
                                            onClick={() => navigate(`/admin/events/${event.id}/view`)} 
                                            title="View Event Details"
                                            style={{...styles.iconActionButton, color: COLORS.PRIMARY}} 
                                            disabled={loading}
                                        >
                                            <FaInfoCircle size={16} /> 
                                        </button>
                                        
                                        <button 
                                            style={{...styles.approveButton}}
                                            onClick={() => handleApproveReject(event.id, 'approve')} 
                                            title="Approve Event"
                                            disabled={loading}
                                        >
                                            <FaCheckCircle size={14} style={{marginRight: '5px'}}/> Approve
                                        </button>
                                        
                                        <button 
                                            style={{...styles.rejectButton}} 
                                            onClick={() => handleApproveReject(event.id, 'reject')} 
                                            title="Reject Event"
                                            disabled={loading}
                                        >
                                            <FaTimesCircle size={14} style={{marginRight: '5px'}}/> Reject
                                        </button>
                                        
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };


    return (
        <div style={styles.dashboardContainer}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
            
            <div style={styles.sidebar}>
                <h2 style={styles.logo}>Kindle</h2>
                <div style={styles.navSectionTitle}>MENU</div>
                
                <div style={styles.navItem} onClick={() => navigate("/admin/dashboard")}>
                    <FaChevronRight size={10} style={{ marginRight: '15px', opacity: 0 }} /> 
                    Dashboard
                </div>
                
                <div style={styles.navItem} onClick={() => navigate("/admin/dashboard")}> 
                    <FaUsers size={14} style={{ marginRight: '15px' }} />
                    User Management
                </div>
                
                <div 
                    style={styles.navItemActive} 
                    onClick={() => navigate("/admin/event-approvals")} 
                >
                    <FaChevronRight size={10} style={{ marginRight: '15px' }} />
                    Event Approvals
                </div>
                <div style={styles.navItem}>
                    <FaShieldAlt size={14} style={{ marginRight: '15px' }} />
                    System Settings
                </div>
                <div 
                    style={{...styles.navItem, marginTop: '30px', color: COLORS.DARK_NAVY, fontWeight: '600'}}
                    onClick={() => {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('role'); 
                        navigate("/admin/login");
                    }} 
                >
                    <FaArrowAltCircleLeft size={14} style={{ marginRight: '15px' }} /> 
                    Log Out
                </div>
                
            </div>


            <div style={styles.mainContent}>
                <div style={styles.headerRow}>
                    <h1 style={styles.mainTitle}><FaClipboardList size={28} style={{marginRight: '10px', color: COLORS.PRIMARY}}/> Event Approvals</h1>
                    <button 
                        style={styles.refreshButton}
                        onClick={handleRefresh}
                        disabled={loading}
                        title="Refresh Event List"
                    >
                        <FaSync size={14} style={{ marginRight: '8px' }} className={loading ? 'spin' : ''}/> 
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                
                </div>
                <p style={styles.mainSubtitle}>Review and manage events awaiting approval.</p>
                
                {actionMessage && (
                    <div style={{...styles.actionMessageBar, ...getActionMessageStyle()}}>
                        {actionMessage.text}
                    </div>
                )}


                <div style={{...styles.dataCard, marginTop: '20px'}}>
                    
                    <h3 style={{...styles.dataCardTitle, marginBottom: '10px'}}>
                        <FaCalendarAlt size={20} style={{marginRight: '10px', color: COLORS.PRIMARY}}/> Pending Events ({pendingEvents.length})
                    </h3>
                    
                    <div style={{...styles.tableToolbar, marginTop: '15px', marginBottom: '25px'}}>
                        <div style={styles.searchWrapper}>
                            <FaSearch style={styles.searchIcon} />
                            <input 
                                type="text" 
                                placeholder="Search by title, organizer, or location..." 
                                style={styles.searchBar} 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* Nút Filter */}
                        <button style={styles.filterButton}>
                            <FaFilter style={{marginRight: '5px'}}/> Filter
                        </button>
                    </div>

                    {renderEventsApprovalTable()}
                </div>
                
            </div>
        </div>
    );
};

const styles: DashboardStyles = {
    dashboardContainer: {
        display: 'flex', minHeight: '100vh', width: '100vw', fontFamily: 'Roboto, Arial, sans-serif', backgroundColor: COLORS.BACKGROUND,
    },
    sidebar: {
        width: '240px', backgroundColor: COLORS.CARD_BG, color: COLORS.DARK_NAVY, padding: '20px 0', borderRight: `1px solid ${COLORS.BORDER}`, flexShrink: 0,
    },
    logo: {
        fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', padding: '0 25px', color: COLORS.DARK_NAVY,
    },
    navSectionTitle: {
        fontSize: '11px', fontWeight: '500', color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 25px 5px', marginTop: '10px',
    },
    navItem: {
        display: 'flex', alignItems: 'center', padding: '10px 25px', cursor: 'pointer', fontSize: '14px', color: COLORS.TEXT_SECONDARY, transition: 'background-color 0.2s',
        ...({ ':hover': { backgroundColor: '#F0F0F0' } } as React.CSSProperties),
    },
    navItemActive: {
        display: 'flex', alignItems: 'center', padding: '10px 25px', cursor: 'default', fontWeight: '500', fontSize: '14px', backgroundColor: '#E8F0FE', color: COLORS.PRIMARY, borderRight: `3px solid ${COLORS.PRIMARY}`,
    },
    mainContent: {
        flexGrow: 1, padding: '30px 40px', backgroundColor: COLORS.BACKGROUND, overflowY: 'auto',
    },
    headerRow: { 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px',
    },
    mainTitle: { 
        fontSize: '28px', fontWeight: '400', color: COLORS.DARK_NAVY, margin: 0, display: 'flex', alignItems: 'center'
    },
    mainSubtitle: { 
        fontSize: '15px', color: COLORS.TEXT_SECONDARY, marginBottom: '30px', 
    },
    refreshButton: { 
        padding: '8px 15px', backgroundColor: COLORS.CARD_BG, color: COLORS.TEXT_SECONDARY, border: `1px solid ${COLORS.BORDER}`, borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '14px',
        display: 'flex', alignItems: 'center', transition: 'background-color 0.2s',
        ...({ ':hover': { backgroundColor: COLORS.BORDER } } as React.CSSProperties),
    },
    
    dataCard: {
        backgroundColor: COLORS.CARD_BG, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
        padding: '30px', 
        marginBottom: '30px', 
    },
    dataCardTitle: {
        fontSize: '20px', fontWeight: '500', color: COLORS.DARK_NAVY, margin: 0, display: 'flex', alignItems: 'center',
    },
    tableToolbar: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    },
    searchWrapper: {
        display: 'flex', alignItems: 'center', position: 'relative', flexGrow: 1, marginRight: '20px', maxWidth: '400px',
    },
    searchBar: {
        padding: '10px 10px 10px 40px', border: `1px solid ${COLORS.BORDER}`, borderRadius: '4px', width: '100%', fontSize: '14px', 
        transition: 'border-color 0.2s, box-shadow 0.2s',
        ...({ ':focus': { borderColor: COLORS.PRIMARY, boxShadow: '0 0 0 1px ' + COLORS.PRIMARY } } as React.CSSProperties),
    },
    searchIcon: {
        position: 'absolute', left: '15px', color: COLORS.TEXT_SECONDARY, fontSize: '16px',
    },
    filterButton: {
        padding: '10px 15px', backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '14px',
        display: 'flex', alignItems: 'center', transition: 'background-color 0.2s',
        ...({ ':hover': { backgroundColor: COLORS.SECONDARY } } as React.CSSProperties),
    },
    
    tableWrapper: {
        overflowX: 'auto', 
    },
    table: {
        width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed',
    },
    th: {
        backgroundColor: COLORS.BACKGROUND, color: COLORS.TEXT_SECONDARY, fontWeight: '600', padding: '15px', textAlign: 'left', borderBottom: `2px solid ${COLORS.BORDER}`, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    td: {
        padding: '15px', borderBottom: `1px solid ${COLORS.BORDER}`, color: COLORS.DARK_NAVY, fontSize: '14px', wordBreak: 'break-word',
    },
    tr: {
        transition: 'background-color 0.2s',
        ...({ ':hover': { backgroundColor: '#F0F3F6' } } as React.CSSProperties),
    },

    emptyState: {
        textAlign: 'center', 
        padding: '40px', 
        color: COLORS.TEXT_SECONDARY, 
        backgroundColor: '#F7F9FC', 
        borderRadius: '6px', 
        border: `1px dashed ${COLORS.BORDER}`,
    },

    actionMessageBar: {
        padding: '15px', borderRadius: '4px', marginBottom: '20px', fontWeight: '500', fontSize: '15px',
    },
    actionSuccessMessage: {
        backgroundColor: '#E6F4EA', color: COLORS.SUCCESS_ACCENT, border: `1px solid ${COLORS.SUCCESS_ACCENT}`,
    },
    actionErrorMessage: {
        backgroundColor: '#FDE7E7', color: COLORS.DANGER, border: `1px solid ${COLORS.DANGER}`,
    },
    
    // ACTION BUTTONS
    actionButtonContainerVertical: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconActionButton: { 
        background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '4px', transition: 'background-color 0.2s, color 0.2s',
        marginBottom: '5px', 
        ...({ ':hover': { backgroundColor: '#E0E0E0' } } as React.CSSProperties),
    },
    approveButton: {
        padding: '8px 12px', backgroundColor: COLORS.SUCCESS_ACCENT, color: COLORS.WHITE, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', display: 'inline-flex', alignItems: 'center', transition: 'background-color 0.2s',
        marginBottom: '10px', 
        width: '100%', 
        maxWidth: '120px', 
        justifyContent: 'center',
        ...({ ':hover': { backgroundColor: '#2B8C44' } } as React.CSSProperties),
    },
    rejectButton: {
        padding: '8px 12px', backgroundColor: COLORS.DANGER, color: COLORS.WHITE, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', display: 'inline-flex', alignItems: 'center', transition: 'background-color 0.2s',
        width: '100%', 
        maxWidth: '120px', 
        justifyContent: 'center',
        ...({ ':hover': { backgroundColor: '#C73327' } } as React.CSSProperties),
    },
};

export default EventsApproval;