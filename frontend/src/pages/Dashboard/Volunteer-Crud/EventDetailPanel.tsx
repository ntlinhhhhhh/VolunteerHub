import React, { useState } from "react";
import {
    FaTimes,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaUsers,
    FaMoneyBillWave,
    FaUserTie,
    FaHourglassEnd,
    FaClipboardList,
    FaCheckCircle,
    FaExpandAlt,
    FaCompressAlt,
} from "react-icons/fa";

import RegistrationForm from "./RegistrationForm"; 

const COLORS = {
    PRIMARY: "#007bff",
    SECONDARY: "#6c757d",
    SUCCESS: "#28a745",
    DANGER: "#dc3545",
    WARNING: "#ffc107",
    INFO: "#17a2b8",
    LIGHT: "#f8f9fa",
    DARK: "#343a30",
    WHITE: "#ffffff",
    BACKGROUND: "#f8f9fa",
    CARD_BG: "#ffffff",
    BORDER: "#e9ecef",
    TEXT_SECONDARY: "#adb5bd",
    DARK_NAVY: "#202124",
    SUCCESS_ACCENT: "#34A853",
};

interface Location {
    address: string;
    city: string;
    district: string;
}

interface Schedule {
    startDate: string; // ISO String
    endDate: string; // ISO String
    registrationDeadline: string; // ISO String
}

interface Capacity {
    maxVolunteers: number;
    currentVolunteers: number;
    minVolunteers: number;
}

interface Media {
    images: string[];
    videos: string[];
    documents: string[];
}

interface Roles { 
    id: string;
    name: string;
    description: string;
    slots: number;
    filled: number;
}

interface ApiEvent { 
    id: string;
    title: string;
    slug: string;
    description: string;
    organizerName: string;
    organizerEmail: string;
    categoryName: string;
    location: Location;
    schedule: Schedule;
    capacity: Capacity;
    roles: Roles[];
    requirements: any;
    status: "published" | "pending" | "closed";
    media: Media;
    tags: string[];
    createdAt: string;
}


interface EventDetailPanelProps {
    event: ApiEvent | null;
    isOpen: boolean;
    onClose: () => void;
    sidebarWidth?: number;
    sidePanelWidth?: number; 
}


const EventDetailPanel: React.FC<EventDetailPanelProps> = ({
    event,
    isOpen,
    onClose,
    sidebarWidth = 250,
    sidePanelWidth = 450,
}) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false); 

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    const handleRegisterClick = () => {
        setShowRegistrationForm(true);
        setIsMaximized(true);
    };

    const handleFormClose = () => {
        setShowRegistrationForm(false);
       
        // setIsMaximized(false);
    };
    
    const getPanelDimensions = (): React.CSSProperties => {
        const fullWidth = `calc(100% - ${sidebarWidth}px)`;
        
        if (!isOpen) {
            return {
                width: sidePanelWidth,
                right: 0,
                left: 'auto',
                transform: "translateX(100%)",
            };
        }
        
        if (isMaximized || showRegistrationForm) {
            return {
                width: fullWidth, // Chiều rộng lớn
                right: 0,         // Neo vào cạnh phải
                left: 'auto',     
                transform: "translateX(0)", 
            };
        } 
        
        else {
            return {
                width: sidePanelWidth, // Chiều rộng nhỏ
                right: 0,              // Neo vào cạnh phải
                left: 'auto',          
                transform: "translateX(0)", 
            };
        }
    }

    const dimensions = getPanelDimensions();

    const panelStyle: React.CSSProperties = {
        position: "fixed",
        top: 0,
        height: "100%",
        backgroundColor: COLORS.WHITE,
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
        transition: "transform 0.4s ease-in-out, width 0.4s ease-in-out", 
        overflowY: "auto",
        ...dimensions, 
    };

    if (!event) return null;
    
    const imageUrl =
        event.media.images[0] ||
        "https://images.unsplash.com/photo-1540321213459-715764d1f274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNTYxNzd8MHwxfGFsbHx8fHx8fHx8fDE2Mzg3ODU3NjI&ixlib=rb-1.2.1&q=80&w=600";
    
    const getFormattedDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "N/A";
        }
    };

    const isRegistrationOpen = new Date(event.schedule.registrationDeadline) > new Date();


    return (
        <div style={panelStyle}>
            {/* HIỂN THỊ FORM ĐĂNG KÝ (hoặc chi tiết sự kiện) */}
            {showRegistrationForm && event ? (
                <RegistrationForm 
                    event={event}
                    roles={event.roles}
                    onClose={handleFormClose} handleLogout={function (): void {
                        throw new Error("Function not implemented.");
                    } }                />
            ) : (
                // HIỂN THỊ CHI TIẾT SỰ KIỆN
                <>
                    <div style={detailStyles.header}>
                        {/* Nút Maximize/Minimize chỉ hiển thị khi không có form */}
                        <button onClick={toggleMaximize} style={detailStyles.maximizeButton}>
                            {isMaximized ? <FaCompressAlt style={{ color: COLORS.DARK}}/> : <FaExpandAlt style={{ color: COLORS.DARK}} />}
                        </button>
                        {/* Nút Close */}
                        <button onClick={onClose} style={detailStyles.closeButton}>
                            <FaTimes />
                        </button>
                        <div
                            style={{
                                ...detailStyles.coverImage,
                                backgroundImage: `url(${imageUrl})`,
                            }}
                        >
                            <span style={detailStyles.categoryTag}>{event.categoryName}</span>
                        </div>
                    </div>

                    <div style={detailStyles.content}>
                        <h2 style={detailStyles.title}>{event.title}</h2>

                        <div style={detailStyles.actionBar}>
                            <button
                                style={{
                                    ...detailStyles.registerButton,
                                    backgroundColor: isRegistrationOpen ? COLORS.PRIMARY : COLORS.SECONDARY,
                                    cursor: isRegistrationOpen ? 'pointer' : 'not-allowed',
                                }}
                                disabled={!isRegistrationOpen}
                                onClick={handleRegisterClick}
                            >
                                {isRegistrationOpen ? "Đăng Ký Tham Gia Ngay" : "Đã Hết Hạn Đăng Ký"}
                            </button>
                            <p style={{ ...detailStyles.statusTag, backgroundColor: COLORS.INFO }}>
                                <FaHourglassEnd style={{ marginRight: 5 }} /> Hạn chót: {getFormattedDate(event.schedule.registrationDeadline)}
                            </p>
                        </div>
                        <div style={detailStyles.section}>
                            <h3 style={detailStyles.sectionTitle}>Thông tin chung</h3>
                            <p style={detailStyles.metaItem}>
                                <FaCalendarAlt style={detailStyles.icon} />
                                Thời gian: Từ {getFormattedDate(event.schedule.startDate)} đến {getFormattedDate(event.schedule.endDate)}
                            </p>
                            <p style={detailStyles.metaItem}>
                                <FaMapMarkerAlt style={detailStyles.icon} />
                                Địa điểm: {event.location.address}, {event.location.district}, {event.location.city}
                            </p>
                            <p style={detailStyles.metaItem}>
                                <FaUsers style={detailStyles.icon} />
                                Tình nguyện viên: {event.capacity.currentVolunteers} / {event.capacity.maxVolunteers} người
                            </p>
                            <p style={detailStyles.metaItem}>
                                <FaUserTie style={detailStyles.icon} />
                                Đơn vị tổ chức: {event.organizerName}
                            </p>
                        </div>

                        <div style={detailStyles.section}>
                            <h3 style={detailStyles.sectionTitle}>Mô tả sự kiện</h3>
                            <p style={detailStyles.descriptionText}>{event.description}</p>
                        </div>

                        <div style={detailStyles.section}>
                            <h3 style={detailStyles.sectionTitle}>Vai trò & Vị trí</h3>
                            {event.roles.map((role, index) => (
                                <div key={index} style={detailStyles.roleItem}>
                                    <p style={detailStyles.roleName}><FaClipboardList style={{ marginRight: 8, color: COLORS.PRIMARY }} />{role.name} ({role.slots - role.filled} slots)</p>
                                    <p style={detailStyles.roleDescription}>{role.description}</p>
                                </div>
                            ))}
                        </div>

                        <div style={detailStyles.section}>
                            <h3 style={detailStyles.sectionTitle}>Yêu cầu Tình nguyện viên</h3>
                            <div style={detailStyles.requirementsGrid}>
                                <div style={detailStyles.requirementItem}>
                                    <FaCheckCircle style={detailStyles.reqIcon} />
                                    Độ tuổi: {event.requirements.minAge || 'N/A'} - {event.requirements.maxAge || 'N/A'}
                                </div>
                                <div style={detailStyles.requirementItem}>
                                    <FaCheckCircle style={detailStyles.reqIcon} />
                                    Kỹ năng: {event.requirements.skills.join(', ') || 'Không yêu cầu kỹ năng đặc biệt'}
                                </div>
                                <div style={detailStyles.requirementItem}>
                                    <FaCheckCircle style={detailStyles.reqIcon} />
                                    Sức khỏe: {event.requirements.healthRequirements || 'Sức khỏe tốt'}
                                </div>
                            </div>
                        </div>

                        <div style={{ height: '50px' }}></div>
                    </div>
                </>
            )}
        </div>
    );
};

export default EventDetailPanel;

const detailStyles: { [key: string]: React.CSSProperties } = {
    header: {
        position: 'relative',
        height: "250px",
    },
    maximizeButton: {
        position: "absolute",
        top: "20px",
        right: "65px",
        backgroundColor: "rgba(0,0,0,0.75)", 
        color: COLORS.WHITE,
        border: `1px solid ${COLORS.WHITE}`, 
        borderRadius: "50%",
        width: "35px",
        height: "35px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 10,
        fontSize: "16px",
        transition: "background-color 0.2s",
    },
    // maximizeButton: {
    //     position: "absolute",
    //     top: "20px",
    //     right: "65px",
    //     backgroundColor: "transparent", // Loại bỏ nền
    //     color: COLORS.DARK, // Đặt màu icon thành màu đen
    //     border: "none", // Loại bỏ viền
    //     borderRadius: "0", // Loại bỏ bo góc
    //     width: "35px",
    //     height: "35px",
    //     display: "flex",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     cursor: "pointer",
    //     zIndex: 20, 
    //     fontSize: "20px", // Tăng kích thước icon lên một chút cho dễ nhìn
    //     transition: "opacity 0.2s",
    // },
    // closeButton: {
    //     position: "absolute",
    //     top: "20px",
    //     right: "20px",
    //     backgroundColor: "transparent", // Loại bỏ nền
    //     color: COLORS.DARK, // Đặt màu icon thành màu đen
    //     border: "none", // Loại bỏ viền
    //     borderRadius: "0", // Loại bỏ bo góc
    //     width: "35px",
    //     height: "35px",
    //     display: "flex",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     cursor: "pointer",
    //     zIndex: 20, 
    //     fontSize: "20px", // Tăng kích thước icon lên một chút cho dễ nhìn
    //     transition: "opacity 0.2s",
    // },
    closeButton: {
        position: "absolute",
        top: "20px",
        right: "20px",
        backgroundColor: "rgba(0,0,0,0.75)", 
        color: COLORS.WHITE,
        border: `1px solid ${COLORS.WHITE}`,
        borderRadius: "50%",
        width: "35px",
        height: "35px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 10,
        fontSize: "16px",
        transition: "background-color 0.2s",
    },
    coverImage: {
        height: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        padding: "20px",
        display: "flex",
        alignItems: "flex-end",
    },
    categoryTag: {
        backgroundColor: COLORS.PRIMARY,
        color: COLORS.WHITE,
        padding: "8px 15px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "700",
    },
    content: {
        padding: "30px",
    },
    title: {
        fontSize: "24px",
        fontWeight: "700",
        color: COLORS.DARK,
        marginBottom: "20px",
    },
    actionBar: {
        marginBottom: "30px",
        paddingBottom: "20px",
        borderBottom: `1px solid ${COLORS.BORDER}`,
    },
    registerButton: {
        width: "100%",
        padding: "15px",
        fontSize: "16px",
        fontWeight: "700",
        borderRadius: "10px",
        border: "none",
        color: COLORS.WHITE,
        marginBottom: "15px",
        boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)",
        transition: "background-color 0.2s",
    },
    statusTag: {
        fontSize: "13px",
        color: COLORS.WHITE,
        padding: "8px 12px",
        borderRadius: "6px",
        textAlign: "center",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.INFO,
    },
    section: {
        marginBottom: "30px",
    },
    sectionTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: COLORS.DARK,
        borderLeft: `4px solid ${COLORS.PRIMARY}`,
        paddingLeft: "10px",
        marginBottom: "15px",
    },
    metaItem: {
        display: "flex",
        alignItems: "flex-start",
        marginBottom: "10px",
        fontSize: "15px",
        color: COLORS.DARK,
        lineHeight: 1.5,
    },
    icon: {
        color: COLORS.PRIMARY,
        marginRight: "10px",
        fontSize: "18px",
        marginTop: "3px",
        minWidth: '18px',
    },
    descriptionText: {
        fontSize: "15px",
        color: COLORS.SECONDARY,
        lineHeight: 1.6,
    },
    roleItem: {
        backgroundColor: COLORS.LIGHT,
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "10px",
    },
    roleName: {
        fontWeight: "700",
        fontSize: "15px",
        color: COLORS.DARK,
        display: 'flex',
        alignItems: 'center',
    },
    roleDescription: {
        fontSize: "13px",
        color: COLORS.SECONDARY,
        marginLeft: "26px",
    },
    requirementsGrid: {
        display: 'grid',
        gap: '10px',
    },
    requirementItem: {
        backgroundColor: '#e6f7e9',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '14px',
        color: COLORS.DARK,
        display: 'flex',
        alignItems: 'center',
        fontWeight: '500',
    },
    reqIcon: {
        color: COLORS.SUCCESS,
        marginRight: '8px',
    }
};