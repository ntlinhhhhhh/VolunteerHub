import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaCheckCircle, FaTimesCircle, FaSync, FaSpinner, FaChevronRight, FaFolderOpen } from 'react-icons/fa';
import { useNavigate } from "react-router-dom"; 

const COLORS = {
    PRIMARY: '#1A73E8',         // Google Blue
    CARD_BG: '#FFFFFF',
    BORDER: '#E0E0E0',          // Light gray border
    SUCCESS_ACCENT: '#1E8E3E',   // Google Green
    DANGER: '#D93025',          // Google Red (stronger)
    TEXT_SECONDARY: '#5F6368',  // Text gray
    TEXT_PRIMARY: '#202124',    // Dark text
    WARNING: '#F9AB00',         // Google Yellow
    HOVER_BG: '#F1F3F4',        // Light hover gray
    WHITE: '#FFF',
    BADGE_BG: '#A50E0E',         // Darker red for badge
    BACKGROUND: '#FAFAFA',      // Light background for header
};

interface PendingEvent {
    id: string;
    title: string;
    organizerName: string;
    createdAt: string;
}

interface PendingEventsNotificationProps {
    pendingCount: number;
    pendingEvents: PendingEvent[];
    onActionSuccess: () => void; 
    token: string;
    loadingPending: boolean;
}


const PendingEventsNotification: React.FC<PendingEventsNotificationProps> = ({ 
    pendingCount, 
    pendingEvents, 
    onActionSuccess, 
    token,
    loadingPending
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    // State quản lý hover cho các item
    const [hoveredEventId, setHoveredEventId] = useState<string | null>(null); 
    const [isViewMoreHovered, setIsViewMoreHovered] = useState(false); 
    
    const wrapperRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [isBellHovered, setIsBellHovered] = useState(false); // Đổi tên để tránh trùng lặp

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => setActionMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [actionMessage]);


    const handleApproveReject = async (eventId: string, action: 'approve' | 'reject') => {
        if (!token) {
            setActionMessage({ type: 'error', text: "Token không tìm thấy." });
            return;
        }

        let rejectionReason: string | null = null; 

        if (action === 'reject') {
            const reasonInput = prompt("Vui lòng nhập lý do từ chối:");
            if (reasonInput === null || reasonInput.trim() === '') {
                setActionMessage({ type: 'error', text: "Phải có lý do để từ chối sự kiện." });
                return;
            }
            rejectionReason = reasonInput.trim(); // OK vì đã kiểm tra null
        } else {
            if (!window.confirm("Bạn có chắc chắn muốn DUYỆT sự kiện này?")) {
                return;
            }
        }

        setLoadingAction(eventId);
        setActionMessage(null);

        const endpoint = `http://localhost:8000/events/${eventId}/${action}`;
        // Đảm bảo body chỉ là undefined hoặc object khi reject
        const body = (action === 'reject' && rejectionReason) 
            ? { rejectionReason } 
            : undefined;
        
        try {
            const res = await fetch(endpoint, {
                method: "POST", 
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
                body: body ? JSON.stringify(body) : undefined, // Truyền body nếu có
            });

            const result = await res.json();

            if (res.ok) {
                setActionMessage({ 
                    type: 'success', 
                    text: `✅ Sự kiện đã được ${action === 'approve' ? 'duyệt' : 'từ chối'}!` 
                });
                onActionSuccess();
            } else {
                setActionMessage({ 
                    type: 'error', 
                    text: `❌ Thao tác thất bại: ${result.message || res.statusText || 'Lỗi không xác định.'}` 
                });
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: "❌ Lỗi mạng." });
        } finally {
            setLoadingAction(null);
        }
    };

    const handleViewAll = () => {
        setIsMenuOpen(false); 
        navigate('/admin/event-approvals'); 
    };


    return (
        <div style={styles.notificationWrapper} ref={wrapperRef}>
            <button 
                style={{ ...styles.bellButton, backgroundColor: isBellHovered ? COLORS.HOVER_BG : 'transparent' }} 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                onMouseEnter={() => setIsBellHovered(true)} // Sửa: Dùng isBellHovered
                onMouseLeave={() => setIsBellHovered(false)} // Sửa: Dùng isBellHovered
                title={`Bạn có ${pendingCount} sự kiện cần duyệt`}
            >
                <FaBell style={styles.bellIcon} />
                {pendingCount > 0 && (
                    <span style={styles.badge}>{pendingCount > 9 ? '9+' : pendingCount}</span>
                )}
            </button>

            {isMenuOpen && (
                <div style={styles.dropdownMenu}>
                    <div style={styles.dropdownHeader}>
                        🔔 Thông báo phê duyệt sự kiện ({pendingCount})
                        {loadingPending && <FaSpinner className="spin" style={styles.loadingIconSmall} />}
                    </div>
                    
                    {actionMessage && (
                        <div style={actionMessage.type === 'success' ? styles.successAlert : styles.errorAlert}>
                            {actionMessage.text}
                        </div>
                    )}
                    <div style={styles.listContainer}>
                        {!loadingPending && pendingCount === 0 && (
                            <div style={styles.emptyContainer}>
                                <FaFolderOpen style={styles.emptyIcon} />
                                <div style={styles.emptyMessage}>Không có sự kiện nào chờ duyệt. Tuyệt vời!</div>
                            </div>
                        )}

                        {!loadingPending && pendingEvents.slice(0, 5).map((event, index) => (
                            <div 
                                key={event.id} 
                                style={{
                                  ...styles.eventItem,
                                  borderBottom: index < pendingEvents.slice(0, 5).length - 1 ? `1px solid ${COLORS.BORDER}` : 'none',
                                    backgroundColor: hoveredEventId === event.id ? COLORS.HOVER_BG : COLORS.CARD_BG, // <<< FIX HOVER
                                }}
                                onMouseEnter={() => setHoveredEventId(event.id)} // <<< THÊM HOVER
                                onMouseLeave={() => setHoveredEventId(null)} // <<< THÊM HOVER
                            >
                                <div style={styles.eventInfo}>
                                    <div style={styles.eventTitle}>{event.title}</div>
                                    <div style={styles.eventMeta}>
                                        Bởi: **{event.organizerName}** | Đã gửi: {new Date(event.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                                <div style={styles.eventActions}>
                                    <button
                                        style={{ ...styles.actionButton, backgroundColor: COLORS.SUCCESS_ACCENT }}
                                        onClick={() => handleApproveReject(event.id, 'approve')}
                                        disabled={loadingAction === event.id}
                                        title="Duyệt"
                                    >
                                        {loadingAction === event.id ? <FaSync className="spin" style={styles.loadingIcon} /> : <FaCheckCircle />}
                                    </button>
                                    <button
                                        style={{ ...styles.actionButton, backgroundColor: COLORS.DANGER, marginLeft: '5px' }}
                                        onClick={() => handleApproveReject(event.id, 'reject')}
                                        disabled={loadingAction === event.id}
                                        title="Từ chối"
                                    >
                                        {loadingAction === event.id ? <FaSync className="spin" style={styles.loadingIcon} /> : <FaTimesCircle />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {pendingCount > 0 && (
                        <div style={styles.viewMoreWrapper}>
                            <button 
                                style={{ 
                                    ...styles.viewMoreButton, 
                                    backgroundColor: isViewMoreHovered ? '#1565C0' : COLORS.PRIMARY, // <<< FIX HOVER
                                    boxShadow: isViewMoreHovered ? '0 1px 3px rgba(0,0,0,0.2)' : 'none', // <<< FIX HOVER
                                }} 
                                onClick={handleViewAll}
                                onMouseEnter={() => setIsViewMoreHovered(true)} // <<< THÊM HOVER
                                onMouseLeave={() => setIsViewMoreHovered(false)} // <<< THÊM HOVER
                            >
                                Xem tất cả sự kiện cần duyệt ({pendingCount}) <FaChevronRight style={{ marginLeft: '5px', fontSize: '12px' }} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles: {[key: string]: React.CSSProperties} = {
    notificationWrapper: {
        position: 'relative',
        display: 'inline-block',
        zIndex: 1000,
    },
    bellButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '50%',
        position: 'relative',
        transition: 'background-color 0.2s',
        lineHeight: 0,
    },
    bellIcon: {
        fontSize: '24px',
        color: COLORS.TEXT_PRIMARY,
    },
    badge: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        backgroundColor: COLORS.BADGE_BG, 
        color: COLORS.WHITE,
        borderRadius: '10px',
        padding: '2px 5px',
        fontSize: '10px',
        fontWeight: 'bold',
        minWidth: '15px',
        textAlign: 'center',
        boxShadow: '0 0 0 2px white',
        lineHeight: '14px',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '50px',
        right: '0',
        width: '380px',
        backgroundColor: COLORS.CARD_BG,
        borderRadius: '8px',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
        padding: '0',
        maxHeight: '60vh',
        overflowY: 'auto',
    },
    dropdownHeader: {
        padding: '12px 15px',
        fontWeight: '500',
        fontSize: '14px',
        color: COLORS.TEXT_PRIMARY,
        borderBottom: `1px solid ${COLORS.BORDER}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.BACKGROUND,
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        position: 'sticky',
        top: 0,
        zIndex: 1,
    },
    listContainer: {
        padding: '0 0 5px 0',
    },
    eventItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 15px',
        transition: 'background-color 0.2s',
        cursor: 'pointer',
    },
    eventInfo: {
        flexGrow: 1,
        marginRight: '10px',
        overflow: 'hidden',
    },
    eventTitle: {
        fontWeight: '600',
        color: COLORS.TEXT_PRIMARY,
        fontSize: '14px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginBottom: '3px',
    },
    eventMeta: {
        fontSize: '11px',
        color: COLORS.TEXT_SECONDARY,
    },
    eventActions: {
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
    },
    actionButton: {
        border: 'none',
        color: COLORS.WHITE,
        padding: '6px',
        borderRadius: '4px',
        cursor: 'pointer',
        lineHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s, transform 0.1s',
        fontSize: '14px',
    },
    loadingIcon: {
        color: COLORS.WHITE,
        fontSize: '14px',
    },
    loadingIconSmall: {
        color: COLORS.PRIMARY,
        fontSize: '12px',
        marginLeft: '10px',
    },
    successAlert: {
        padding: '10px 15px',
        backgroundColor: '#E6F4EA',
        color: COLORS.SUCCESS_ACCENT,
        fontSize: '13px',
        borderBottom: `1px solid ${COLORS.BORDER}`,
    },
    errorAlert: {
        padding: '10px 15px',
        backgroundColor: '#FAD2CF',
        color: COLORS.DANGER,
        fontSize: '13px',
        borderBottom: `1px solid ${COLORS.BORDER}`,
    },
    emptyContainer: {
        padding: '30px 20px',
        textAlign: 'center',
    },
    emptyIcon: {
        fontSize: '40px',
        color: COLORS.TEXT_SECONDARY,
        opacity: 0.4,
        marginBottom: '10px',
    },
    emptyMessage: {
        color: COLORS.TEXT_SECONDARY,
        fontSize: '14px',
        lineHeight: 1.5,
    },
    viewMoreWrapper: {
        padding: '8px 15px 12px 15px',
        borderTop: `1px solid ${COLORS.BORDER}`,
        backgroundColor: COLORS.CARD_BG,
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        position: 'sticky',
        bottom: 0,
        zIndex: 1,
    },
    viewMoreButton: {
        width: '100%',
        padding: '8px 12px',
        color: COLORS.WHITE,
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500', 
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s, box-shadow 0.2s',
    }
};

export default PendingEventsNotification;