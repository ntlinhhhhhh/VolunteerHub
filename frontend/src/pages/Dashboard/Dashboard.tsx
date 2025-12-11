// Dashboard.tsx (FULL CODE CẬP NHẬT)
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaCompass,
  FaChartBar,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaUser,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaUsers,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
// Đảm bảo các component này đã được tạo và import đúng đường dẫn
import EventDetailPanel from "./Volunteer-Crud/EventDetailPanel"; 
import NotificationHandler from "./Volunteer-Crud/NotificationHandler";
import NotificationIcon from "./Volunteer-Crud/NotificationIcon";

const COLORS = {
  PRIMARY: "#007bff",
  SECONDARY: "#6c757d",
  SUCCESS: "#28a745",
  DANGER: "#dc3545",
  WARNING: "#ffc107",
  INFO: "#17a2b8",
  LIGHT: "#f8f9fa",
  DARK: "#343a40",
  WHITE: "#ffffff",
  BACKGROUND: "#f8f9fa",
  CARD_BG: "#ffffff",
  BORDER: "#e9ecef",
  TEXT_SECONDARY: "#adb5bd",
  DARK_NAVY: "#202124",
  SUCCESS_ACCENT: "#34A853",
};

// --- INTERFACES (Giữ nguyên) ---
interface Location { address: string; city: string; district: string; }
interface Schedule { startDate: string; endDate: string; registrationDeadline: string; }
interface Capacity { maxVolunteers: number; currentVolunteers: number; minVolunteers: number; }
interface Media { images: string[]; videos: string[]; documents: string[]; }
interface Roles { id: string; name: string; description: string; slots: number; filled: number; }
interface ApiEvent {
  id: string; slug: string; title: string; description: string; organizerName: string; organizerEmail: string; categoryName: string; location: Location; schedule: Schedule; capacity: Capacity; roles: Roles[]; requirements: any; status: "published" | "pending" | "closed"; media: Media; tags: string[]; createdAt: string; updatedAt: string;
}
interface UserData {
  id: string; email: string; username: string; fullName: string | null; phoneNumber: string | null; avatar: string | null; address: string | null; bio: string | null; dateOfBirth: string | null;
}
// interface Registration { // Đã di chuyển vào Dashboard component để tránh lỗi scope nếu cần
//     id: string;
//     eventId: string; 
//     roleName: string;
//     status: "pending" | "confirmed" | "rejected";
// }

// --- useFetchEvents (Giữ nguyên) ---
const useFetchEvents = (status: string) => {
    const [events, setEvents] = useState<ApiEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        // Thay đổi URL API phù hợp với project của bạn nếu cần
        const apiUrl = `http://localhost:8000/events?status=${status}`; 

        try {
            const res = await fetch(apiUrl, {
            headers: {
                Accept: "application/json",
            },
            });

            if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json();

            if (result.success && Array.isArray(result.data)) {
            setEvents(result.data);
            } else {
            setError("Invalid data format from API.");
            }
        } catch (err: any) {
            console.error("Failed to fetch events:", err);
            setError(`Failed to fetch events: ${err.message}`);
        } finally {
            setLoading(false);
        }
        };

        fetchEvents();
    }, [status]);

    return { events, loading, error };
};

// --- EventCard (Giữ nguyên) ---
const EventCard: React.FC<{ event: ApiEvent, onClick: () => void }> = ({ event, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { currentVolunteers, maxVolunteers } = event.capacity;
    const availabilityPercent = Math.min(
        100,
        Math.round((currentVolunteers / maxVolunteers) * 100)
    );

    const imageUrl =
        event.media.images[0] ||
        "https://images.unsplash.com/photo-1540321213459-715764d1f274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNTYxNzd8MHwxfGFsbHx8fHx8fHx8fDE2Mzg3ODU3NjI&ixlib=rb-1.2.1&q=80&w=600";

    const formattedDate = useMemo(() => {
        try {
        const date = new Date(event.schedule.startDate);
        if (isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        } catch {
        return "N/A";
        }
    }, [event.schedule.startDate]);

    return (
        <div 
            style={{
                ...styles.eventCard,
                transform: isHovered ? "translateY(-5px)" : "translateY(0)",
                boxShadow: isHovered ? "0 15px 35px rgba(0,0,0,0.1)" : "0 10px 25px rgba(0,0,0,0.03)",
            }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
        <div
            style={{
            ...styles.eventImageWrapper,
            backgroundImage: `url(${imageUrl})`,
            }}
        >
            <span style={styles.eventCategoryTag}>{event.categoryName}</span>
        </div>
        <div style={styles.eventCardContent}>
            <h3 style={styles.eventCardTitle}>{event.title}</h3>
            <div style={styles.eventCardMeta}>
            <p style={styles.eventMetaItem}>
                <FaCalendarAlt style={{ marginRight: "5px" }} /> {formattedDate}
            </p>
            <p style={styles.eventMetaItem}>
                <FaMapMarkerAlt style={{ marginRight: "5px" }} />{" "}
                {`${event.location.address}, ${event.location.district}`}
            </p>
            <p style={styles.eventMetaItemSmall}>
                <FaUsers style={{ marginRight: "5px" }} />
                {currentVolunteers} / {maxVolunteers} tình nguyện viên
            </p>
            </div>
            <div style={styles.progressBarContainer}>
            <div style={styles.progressBarBack}>
                <div
                style={{
                    ...styles.progressBarFill,
                    width: `${availabilityPercent}%`,
                }}
                ></div>
            </div>
            <span style={styles.progressBarText}>
                Đã đăng ký: {availabilityPercent}%
            </span>
            </div>
        </div>
        </div>
    );
};


// --- DASHBOARD COMPONENT ---
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<
    "overview" | "browse" | "insights" | "profile"
  >("browse");
  const [user, setUser] = useState<UserData | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);
  const [isSaveButtonHovered, setIsSaveButtonHovered] = useState(false);
  
  // --- THÊM/CẬP NHẬT STATE CHO NOTIFICATION ---
  const [notificationCount, setNotificationCount] = useState(0);
  const [forceShowNotification, setForceShowNotification] = useState(false);
  
  const PANEL_WIDTH = 450; 

  // interface Registration { // Không cần thiết nếu không dùng trong component Dashboard
  //     id: string;
  //     eventId: string; 
  //     roleName: string;
  //     status: "pending" | "confirmed" | "rejected";
  //   }

  const handleCardClick = (event: ApiEvent) => {
    setSelectedEvent(event);
    setIsPanelOpen(true);
  };
  
  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedEvent(null);
  };
  
  // --- HÀM CẬP NHẬT SỐ LƯỢNG THÔNG BÁO (Callback từ NotificationHandler) ---
  const handleNotificationCountChange = useCallback((count: number) => {
      setNotificationCount(count);
  }, []);

  // --- HÀM XỬ LÝ KHI CLICK VÀO ICON CHUÔNG (Trigger NotificationHandler hiển thị) ---
  const handleNotificationIconClick = () => {
      if (notificationCount > 0) {
          // Kích hoạt việc hiển thị thông báo đầu tiên trong NotificationHandler
          setForceShowNotification(true);
          // Đóng menu nếu đang mở
          setShowMenu(false); 
      }
  };
  
  // --- HÀM ĐƯỢC GỌI KHI NotificationHandler ĐÃ XỬ LÝ FORCE SHOW (Đảm bảo chỉ trigger 1 lần) ---
  const handleForceShowHandled = useCallback(() => {
      setForceShowNotification(false);
  }, []);


  const {
    events: publishedEvents,
    loading: eventsLoading,
    error: eventsError,
  } = useFetchEvents("published");

  const [formData, setFormData] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  
  // --- fetchUserProfile (Giữ nguyên) ---
  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    const defaultAvatarUrl =
      "http://localhost:8000/uploads/avatars/default.png";

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
        return;
      }

      const result = await res.json();

      if (!result || !result.success || !result.data) return;

      const userData = result.data;

      // Xử lý avatar
      userData.avatar = userData.avatar
        ? userData.avatar.startsWith("http")
          ? userData.avatar
          : `http://localhost:8000${userData.avatar}`
        : defaultAvatarUrl;

      const dob = userData.dateOfBirth
        ? userData.dateOfBirth.split("T")[0]
        : "";

      setUser(userData);
      setFormData({
        fullName: userData.fullName || "",
        username: userData.username || "",
        phoneNumber: userData.phoneNumber || "",
        bio: userData.bio || "",
        dateOfBirth: dob,
        avatar: userData.avatar,
      });
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);
  
  // --- Các handlers khác (Giữ nguyên) ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setUpdateMessage(null);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    setUpdateMessage(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUpdateMessage("Authentication failed. Please log in again.");
      setIsUpdating(false);
      return;
    }

    try {
      const bodyData = {
        fullName: formData.fullName,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        dateOfBirth: formData.dateOfBirth,
        avatar: formData.avatar,
      };

      const res = await fetch("http://localhost:8000/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const updatedData = result.data;
        const updatedDob = updatedData.dateOfBirth
          ? updatedData.dateOfBirth.split("T")[0]
          : "";

        updatedData.avatar = updatedData.avatar.startsWith("http")
          ? updatedData.avatar
          : `http://localhost:8000${updatedData.avatar}`;

        setUser(updatedData);
        setFormData({
          ...formData,
          fullName: updatedData.fullName || "",
          username: updatedData.username || "",
          phoneNumber: updatedData.phoneNumber || "",
          bio: updatedData.bio || "",
          dateOfBirth: updatedDob,
          avatar: updatedData.avatar,
        });
        setUpdateMessage("🚀 Profile updated successfully!");
      } else {
        setUpdateMessage(
          `Error: ${result.message || "Failed to update profile."}`
        );
      }
    } catch (error) {
      setUpdateMessage("Network error. Could not connect to the server.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken"); 
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };
  
  // --- Cập nhật Style để áp dụng hiệu ứng thu gọn khi EventDetailPanel mở ---
  const mainContentShrinkStyle: React.CSSProperties = {
      width: isPanelOpen 
          ? `calc(100% - 260px - ${PANEL_WIDTH}px)` 
          : 'calc(100% - 260px)',
      paddingRight: isPanelOpen ? `${40}px` : '40px', // Giữ paddingRight ổn định
      transition: "width 0.4s ease-in-out, padding-right 0.4s ease-in-out",
      boxSizing: 'border-box', 
  };
  
  const contentMainBaseStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: "30px 40px",
    height: "100vh",
    overflowY: "auto",
    backgroundColor: COLORS.BACKGROUND,
    boxSizing: "border-box",
    transition: "width 0.4s ease-in-out, padding-right 0.4s ease-in-out",
  };
  

  return (
    <div style={styles.dashboardContainer}>
      
      {/* 1. SIDEBAR (Giữ nguyên) */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarTitle}>VolunteerHub</div>
        <div style={styles.sidebarSubtitle}>Event Management</div>

        <div style={styles.navItemContainer}>
          <div
            style={{
              ...styles.navItem,
              ...(activeSection === "overview" ? styles.navItemSelected : {}),
            }}
            onClick={() => setActiveSection("overview")}
          >
            <FaCompass style={styles.navIcon} /> Overview
          </div>
          <div
            style={{
              ...styles.navItem,
              ...(activeSection === "browse" ? styles.navItemSelected : {}),
            }}
            onClick={() => setActiveSection("browse")}
          >
            <FaCalendarAlt style={styles.navIcon} /> Browse Events
          </div>
          <div
            style={{
              ...styles.navItem,
              ...(activeSection === "insights" ? styles.navItemSelected : {}),
            }}
            onClick={() => setActiveSection("insights")}
          >
            <FaChartBar style={styles.navIcon} /> Attendee Insights
          </div>
          <div
            style={{
              ...styles.navItem,
              ...(activeSection === "profile" ? styles.navItemSelected : {}),
            }}
            onClick={() => setActiveSection("profile")}
          >
            <FaUser style={styles.navIcon} /> My Profile
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT (Đã áp dụng style thu gọn) */}
      <div style={{...contentMainBaseStyle, ...mainContentShrinkStyle}}>
        <div style={styles.topBar}>
          {/* Spacer (Giữ nguyên) */}
          <div></div> 
          
          {/* USER BOX và NOTIFICATION ICON (Đã thêm headerRightGroup) */}
          <div style={styles.headerRightGroup}>
              {/* Thêm Notification Icon ở đây */}
              <NotificationIcon 
                  count={notificationCount} 
                  onClick={handleNotificationIconClick}
              />
              
              {user && (
                  <div style={styles.userBox} onClick={() => setShowMenu(!showMenu)}>
                      <img
                          src={
                              formData.avatar || 
                              "http://localhost:8000/uploads/avatars/default.png"
                          }
                          alt="avatar"
                          style={styles.avatar}
                      />
                      <span style={styles.userName}>{user.email}</span>
                      {showMenu && (
                          <div style={styles.dropdown}>
                              <div
                                  style={styles.dropdownItem}
                                  onClick={() => {
                                      setActiveSection("profile");
                                      setShowMenu(false);
                                  }}
                              >
                                  Profile
                              </div>
                              <div style={styles.dropdownItem} onClick={handleLogout}>
                                  Logout
                              </div>
                          </div>
                      )}
                  </div>
              )}
          </div>
        </div>
        
        {/* Render sections */}
        {activeSection === "browse" && (
          <>
            <h1 style={styles.contentTitle}>Browse Events</h1>
            <p style={styles.contentSubtitle}>
              Discover volunteering events you love
            </p>

            <div style={styles.searchBarWrapper}>
              <div style={styles.searchInputGroup}>
                <FaSearch style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search events..."
                  style={styles.searchInput}
                />
              </div>
              <button style={styles.filterButton}>
                <FaFilter style={{ marginRight: "8px" }} /> Filters
              </button>
            </div>

            {eventsLoading && (
              <div style={styles.loadingMessage}>
                <FaSpinner style={styles.spinnerIcon} /> Loading events...
              </div>
            )}

            {eventsError && (
              <div style={styles.errorMessage}>
                <FaExclamationTriangle style={{ marginRight: "8px" }} />{" "}
                {eventsError}
              </div>
            )}

            {!eventsLoading && !eventsError && publishedEvents.length === 0 && (
              <div style={styles.noDataMessage}>
                No published events found.
              </div>
            )}

            {!eventsLoading &&
              !eventsError &&
              publishedEvents.length > 0 && (
                <div style={styles.eventGrid}>
                  {publishedEvents.map((event) => (
                    <EventCard key={event.id} event={event} onClick={() => handleCardClick(event)} />
                  ))}
                </div>
              )}
          </>
        )}

        {activeSection === "profile" && (
          <div style={styles.profileContainer}>
            <h1 style={styles.contentTitle}>My Profile</h1>
            <p style={styles.contentSubtitle}>
              Manage your personal information
            </p>

            <div style={styles.profileFormCard}>
              <div
                style={{
                  ...styles.formGroup,
                  textAlign: "center",
                  marginBottom: "30px",
                }}
              >
                <img
                  src={
                    formData.avatar ||
                    "https://avatar.iran.liara.run/public/11"
                  }
                  alt="User Avatar"
                  style={styles.profileAvatar}
                />
                <label style={styles.label}>Avatar URL</label>
                <input
                  name="avatar"
                  value={formData.avatar || ""}
                  onChange={handleInputChange}
                  placeholder="Enter Avatar URL"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  value={user?.email || ""}
                  disabled
                  style={{ ...styles.input, background: "#e9ecef" }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  type="tel"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth</label>
                <input
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  type="date"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  style={styles.textarea}
                />
              </div>

              {updateMessage && (
                <p
                  style={{
                    ...styles.messageStyle,
                    color: updateMessage.includes("successfully")
                      ? COLORS.SUCCESS
                      : COLORS.DANGER,
                  }}
                >
                  {updateMessage.includes("successfully") ? (
                    <FaCheckCircle style={{ marginRight: "8px" }} />
                  ) : (
                    <FaExclamationTriangle style={{ marginRight: "8px" }} />
                  )}
                  {updateMessage.replace("🚀 ", "")}
                </p>
              )}

              <button
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                onMouseEnter={() => setIsSaveButtonHovered(true)}
                onMouseLeave={() => setIsSaveButtonHovered(false)}
                style={{ 
                    ...styles.saveButton, 
                    opacity: isUpdating ? 0.7 : 1,
                    ...(isSaveButtonHovered ? styles.saveButtonHover : {})
                }}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {activeSection === "overview" && (
          <div style={{ padding: "20px" }}>
            <h2>Overview Content (To be developed)</h2>
          </div>
        )}
        {activeSection === "insights" && (
          <div style={{ padding: "20px" }}>
            <h2>Insights Content (To be developed)</h2>
          </div>
        )}
      </div>
      
      {/* 3. EVENT DETAIL PANEL (Giữ nguyên) */}
      <EventDetailPanel event={selectedEvent} isOpen={isPanelOpen} onClose={handleClosePanel} />
      
      {/* 4. NOTIFICATION HANDLER (Đã thêm) */}
      <NotificationHandler 
          onNotificationCountChange={handleNotificationCountChange}
          forceShowNotification={forceShowNotification}
          onForceShowHandled={handleForceShowHandled}
      />
      
    </div>
  );
};

// --- STYLE MỚI (CHỈ THÊM THUỘC TÍNH headerRightGroup VÀ CẬP NHẬT topBar) ---
const styles: { [key: string]: React.CSSProperties } = {
  // THÊM:
  headerRightGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
  },
  // CẬP NHẬT topBar để căn chỉnh userBox và NotificationIcon
  topBar: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between", // Đảm bảo căn chỉnh hai bên
    marginBottom: 30,
    height: "50px",
    alignItems: "center",
  },
  // Các styles khác (Giữ nguyên)
  dashboardContainer: {
    display: "flex",
    minHeight: "100vh",
    height: "100vh",
    width: "100vw",
    backgroundColor: COLORS.BACKGROUND,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    overflow: "hidden",
  },
  sidebar: {
    width: "260px",
    minWidth: "260px",
    backgroundColor: COLORS.WHITE,
    padding: "30px 0",
    borderRight: `1px solid ${COLORS.BORDER}`,
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflowY: "auto",
  },
  sidebarTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.DARK,
    padding: "0 30px",
    marginBottom: "5px",
  },
  sidebarSubtitle: {
    fontSize: "14px",
    color: COLORS.TEXT_SECONDARY,
    marginBottom: "40px",
    padding: "0 30px",
  },
  navItemContainer: { padding: "0" },
  navItem: {
    display: "flex",
    alignItems: "center",
    padding: "14px 30px",
    cursor: "pointer",
    color: COLORS.SECONDARY,
    fontSize: "15px",
    fontWeight: "500",
    transition: "all 0.2s",
    marginBottom: "2px",
    borderLeft: "4px solid transparent",
  },
  navItemSelected: {
    backgroundColor: "#f0f7ff",
    color: COLORS.PRIMARY,
    fontWeight: "600",
    borderLeft: `4px solid ${COLORS.PRIMARY}`,
    borderRight: "none",
  },
  navIcon: { marginRight: "12px", fontSize: "18px" },
  userBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "6px 12px",
    background: COLORS.WHITE,
    border: `1px solid ${COLORS.BORDER}`,
    borderRadius: 20,
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
    transition: "0.2s",
  },
  avatar: { width: 32, height: 32, borderRadius: "50%", objectFit: "cover" },
  userName: { fontSize: 14, color: COLORS.DARK, fontWeight: "500" },

  dropdown: {
    position: "absolute",
    top: "50px",
    right: "0",
    backgroundColor: COLORS.WHITE,
    color: COLORS.DARK,
    padding: "5px",
    borderRadius: "8px",
    minWidth: "140px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    zIndex: 999,
    border: `1px solid ${COLORS.BORDER}`,
  },
  dropdownItem: {
    padding: "10px 15px",
    cursor: "pointer",
    color: COLORS.DARK,
    fontSize: "14px",
    borderRadius: "6px",
    transition: "0.2s",
    //'&:hover': {
        backgroundColor: COLORS.LIGHT,
    //}
  },

  contentTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: COLORS.DARK,
    marginBottom: "8px",
    marginTop: 0,
  },
  contentSubtitle: {
    fontSize: "16px",
    color: COLORS.SECONDARY,
    marginBottom: "30px",
    marginTop: 0,
  },

  searchBarWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  searchInputGroup: {
    display: "flex",
    alignItems: "center",
    border: `1px solid ${COLORS.BORDER}`,
    borderRadius: "10px",
    padding: "10px 15px",
    backgroundColor: COLORS.WHITE,
    flexGrow: 1,
    marginRight: "20px",
    maxWidth: "450px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
  },
  searchIcon: { color: COLORS.TEXT_SECONDARY, marginRight: "10px" },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: "15px",
    width: "100%",
    backgroundColor: "transparent",
    color: COLORS.DARK,
  },
  filterButton: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: COLORS.WHITE,
    color: COLORS.SECONDARY,
    border: `1px solid ${COLORS.BORDER}`,
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
  },
  eventGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "30px",
    paddingBottom: "40px",
  },
  eventCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    border: `1px solid ${COLORS.BORDER}`,
  },
  eventImageWrapper: {
    height: "160px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    justifyContent: "flex-end",
    padding: "15px",
  },
  eventCategoryTag: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    color: COLORS.WHITE,
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  eventCardContent: { padding: "20px" },
  eventCardTitle: {
    fontSize: "17px",
    fontWeight: "700",
    marginBottom: "10px",
    color: COLORS.DARK,
    lineHeight: 1.4,
  },
  eventCardMeta: { marginBottom: "15px" },
  eventMetaItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "6px",
    fontSize: "13px",
    color: COLORS.SECONDARY,
  },
  eventMetaItemSmall: {
    marginTop: "8px",
    fontSize: "12px",
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
  },
  progressBarContainer: { marginTop: "15px" },
  progressBarBack: {
    height: "6px",
    backgroundColor: COLORS.BORDER,
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.SUCCESS_ACCENT,
    borderRadius: "3px",
  },
  progressBarText: {
    fontSize: "12px",
    color: COLORS.TEXT_SECONDARY,
    marginTop: "6px",
    display: "block",
    textAlign: "right",
  },
  loadingMessage: {
    textAlign: "center",
    padding: "50px",
    fontSize: "18px",
    color: COLORS.PRIMARY,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  errorMessage: {
    textAlign: "center",
    padding: "50px",
    fontSize: "18px",
    color: COLORS.DANGER,
    backgroundColor: "#fceaea",
    borderRadius: "10px",
    border: `1px solid ${COLORS.DANGER}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  noDataMessage: {
    textAlign: "center",
    padding: "50px",
    fontSize: "18px",
    color: COLORS.SECONDARY,
    backgroundColor: COLORS.LIGHT,
    borderRadius: "10px",
  },
  spinnerIcon: {
    marginRight: "10px",
    animation: "spin 1s linear infinite",
  },

  profileContainer: {
    maxWidth: "800px",
    paddingBottom: "50px",
  },
  profileFormCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
    border: `1px solid ${COLORS.BORDER}`,
  },
  profileAvatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "15px",
    border: `3px solid ${COLORS.BORDER}`,
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: COLORS.SECONDARY,
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.BORDER}`,
    backgroundColor: COLORS.WHITE,
    color: COLORS.DARK,
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.BORDER}`,
    backgroundColor: COLORS.WHITE,
    color: COLORS.DARK,
    outline: "none",
    minHeight: "100px",
    resize: "vertical",
    transition: "border-color 0.2s",
  },
  saveButton: {
    backgroundColor: COLORS.SUCCESS,
    color: COLORS.WHITE,
    padding: "12px 25px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s, opacity 0.2s",
    marginTop: "15px",
    width: "auto",
  },
  saveButtonHover: {
    backgroundColor: COLORS.SUCCESS_ACCENT, 
  },
  messageStyle: {
    padding: "10px 15px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.LIGHT,
  },
};

export default Dashboard;