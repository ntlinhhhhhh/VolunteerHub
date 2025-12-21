import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaCheckCircle, FaTimes, FaSpinner } from 'react-icons/fa';

const COLORS = {
    PRIMARY: "#007bff",
    SECONDARY: "#6c757d",
    SUCCESS: "#28a745",
    DANGER: "#dc3545",
    WARNING: "#ffc107",
    WHITE: "#ffffff",
    DARK_NAVY: "#202124",
    LIGHT: "#f8f9fa",
};

interface RegistrationData {
    id: string;
    eventTitle: string;
    status: 'pending' | 'accepted' | 'rejected' | 'confirmed';
    registrationCode: string;
}

const notificationStyles: { [key: string]: React.CSSProperties } = {
    notificationContainer: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        width: '350px',
        backgroundColor: COLORS.WHITE,
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '15px',
        borderLeft: `5px solid ${COLORS.SUCCESS}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease-out',
    },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
    title: { fontSize: '16px', fontWeight: '700', color: COLORS.DARK_NAVY, display: 'flex', alignItems: 'center', margin: 0 },
    message: { fontSize: '14px', color: COLORS.DARK_NAVY, marginBottom: '15px', lineHeight: '1.4' },
    buttonRow: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
    confirmButton: { padding: '8px 15px', backgroundColor: COLORS.SUCCESS, color: COLORS.WHITE, border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'background-color 0.2s' },
    dismissButton: { padding: '8px 15px', backgroundColor: COLORS.SECONDARY, color: COLORS.WHITE, border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'background-color 0.2s' },
    statusBadge: { padding: '5px 10px', borderRadius: '5px', fontWeight: '600', fontSize: '12px', textAlign: 'center' as const, backgroundColor: COLORS.LIGHT, color: COLORS.DARK_NAVY, marginTop: '5px' }
};

interface NotificationHandlerProps {
    onNotificationCountChange: (count: number) => void;
    forceShowNotification: boolean;
    onForceShowHandled: () => void;
}


const NotificationHandler: React.FC<NotificationHandlerProps> = ({ onNotificationCountChange, forceShowNotification, onForceShowHandled }) => {
    
    const [acceptedRegistrations, setAcceptedRegistrations] = useState<RegistrationData[]>([]);
    const [currentNotification, setCurrentNotification] = useState<RegistrationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const pendingConfirmationCount = acceptedRegistrations.length;

    useEffect(() => {
        onNotificationCountChange(pendingConfirmationCount);
    }, [pendingConfirmationCount, onNotificationCountChange]);

    useEffect(() => {
        if (forceShowNotification && pendingConfirmationCount > 0 && currentNotification === null) {
            setCurrentNotification(acceptedRegistrations[0]);
            onForceShowHandled();
        } else if (forceShowNotification) {
            onForceShowHandled(); 
        }
    }, [forceShowNotification, pendingConfirmationCount, acceptedRegistrations, currentNotification, onForceShowHandled]);


    const fetchMyRegistrations = useCallback(async () => {
        const authToken = localStorage.getItem("accessToken");
        if (!authToken) return;

        const apiMyRegistrations = `http://localhost:8000/registrations/my-registrations`; 

        try {
            const response = await fetch(apiMyRegistrations, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            
            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                return;
            }

            if (!response.ok) throw new Error("Failed to fetch registrations list");
            
            const result = await response.json();
            
            if (result.success && Array.isArray(result.data)) {
                const acceptedButNotConfirmed = result.data.filter(
                    (reg: RegistrationData) => reg.status === 'accepted'
                );
                
                setAcceptedRegistrations(acceptedButNotConfirmed);
                
                if (acceptedButNotConfirmed.length > 0 && currentNotification === null) {
                    setCurrentNotification(acceptedButNotConfirmed[0]);
                } else if (acceptedButNotConfirmed.length === 0) {
                    setCurrentNotification(null);
                }
            }

        } catch (e) {
            console.error("Error fetching registrations:", e);
        }
    }, [currentNotification]);


    useEffect(() => {
        fetchMyRegistrations();
        // Polling mỗi 10 giây
        const interval = setInterval(fetchMyRegistrations, 10000); 

        return () => clearInterval(interval); 
    }, [fetchMyRegistrations]);

    const handleConfirm = async () => {
        if (!currentNotification) return;
        setIsLoading(true);
        const authToken = localStorage.getItem("accessToken");
        const registrationId = currentNotification.id;

        const confirmApiUrl = `http://localhost:8000/registrations/${registrationId}/confirm`;

        try {
            const response = await fetch(confirmApiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
            }

            alert(`Đã xác nhận tham gia sự kiện: ${currentNotification.eventTitle}`);
            
            // Xóa thông báo hiện tại và kích hoạt fetch lại để làm sạch data
            setCurrentNotification(null); 
            // Cập nhật local state ngay lập tức
            const updatedRegistrations = acceptedRegistrations.filter(reg => reg.id !== currentNotification.id);
            setAcceptedRegistrations(updatedRegistrations);
            // Sau đó fetch lại để đảm bảo đồng bộ
            fetchMyRegistrations(); 

        } catch (error) {
            console.error("Lỗi khi xác nhận tham gia:", error);
            alert("Lỗi khi xác nhận tham gia. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDismiss = () => {
        if (!currentNotification) return;

        const updatedRegistrations = acceptedRegistrations.filter(reg => reg.id !== currentNotification.id);
        setAcceptedRegistrations(updatedRegistrations);

        if (updatedRegistrations.length > 0) {
            setCurrentNotification(updatedRegistrations[0]); 
        } else {
            setCurrentNotification(null); 
        }
    };

    if (!currentNotification) {
        return null;
    }

    return (
        <div style={notificationStyles.notificationContainer}>
            <div style={notificationStyles.header}>
                <p style={notificationStyles.title}>
                    <FaCheckCircle style={{ marginRight: '8px', color: COLORS.SUCCESS }} /> 
                    Đơn Đăng Ký Đã Được Duyệt!
                </p>
                <FaTimes 
                    style={{ color: COLORS.SECONDARY, cursor: 'pointer', fontSize: '14px' }} 
                    onClick={handleDismiss} 
                />
            </div>
            <p style={notificationStyles.message}>
                Đơn đăng ký sự kiện "{currentNotification.eventTitle}" (Mã: {currentNotification.registrationCode}) của bạn đã được chấp nhận.
                <div style={notificationStyles.statusBadge}>Trạng thái: Đã Chấp Nhận</div>
                <br/>
                Vui lòng nhấn Xác Nhận Tham Gia để xác nhận bạn sẽ có mặt.
                {acceptedRegistrations.length > 1 && (
                    <span style={{ display: 'block', marginTop: '5px', color: COLORS.PRIMARY, fontWeight: 'bold' }}>
                        (Và {acceptedRegistrations.length - 1} thông báo khác đang chờ)
                    </span>
                )}
            </p>
            <div style={notificationStyles.buttonRow}>
                <button 
                    onClick={handleDismiss} 
                    style={notificationStyles.dismissButton}
                    disabled={isLoading}
                >
                    Để sau
                </button>
                <button 
                    onClick={handleConfirm}
                    style={notificationStyles.confirmButton}
                    disabled={isLoading}
                >
                    {isLoading ? (<FaSpinner style={{ animation: 'spin 1s linear infinite' }}/>) : 'Xác Nhận Tham Gia'}
                </button>
            </div>
        </div>
    );
};

export default NotificationHandler;