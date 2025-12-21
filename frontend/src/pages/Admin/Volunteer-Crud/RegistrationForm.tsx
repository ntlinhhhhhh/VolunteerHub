import React, { useState } from 'react';
import { FaTimes, FaCheckCircle, FaUserShield, FaHeart, FaHandsHelping, FaPhoneVolume, FaCalendarAlt, FaExclamationTriangle, FaHourglassHalf } from 'react-icons/fa';

const COLORS = {
    PRIMARY: "#007bff",
    SECONDARY: "#6c757d",
    SUCCESS: "#28a745",
    DANGER: "#dc3545",
    WARNING: "#ffc107", // Màu Cảnh Báo (Dùng cho Waiting)
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

interface Roles { 
    id: string;
    name: string;
    description: string;
    slots: number;
    filled: number;
}
interface Location { address: string; city: string; district: string; }
interface Schedule { startDate: string; endDate: string; registrationDeadline: string; }
interface Requirements { skills: string[]; minAge?: number; maxAge?: number; healthRequirements?: string; }
interface ApiEvent { 
    id: string;
    title: string;
    roles: Roles[];
    requirements: Requirements; 
    location: Location;
    schedule: Schedule;
}
interface FormData {
    eventId: string;
    roleId: string;
    motivation: string;
    skills: string[]; 
    availability: string;
    experience: string;
    emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
    };
}
interface RegistrationFormProps {
    event: ApiEvent;
    roles: Roles[];
    onClose: () => void;
    handleLogout: () => void; 
}


const formStyles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: '30px',
        height: '100%',
        overflowY: 'auto',
        backgroundColor: COLORS.CARD_BG, 
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `2px solid ${COLORS.PRIMARY}`,
        paddingBottom: '15px',
        marginBottom: '20px',
    },
    statusBox: {
        padding: '10px',
        borderRadius: '8px',
        color: COLORS.WHITE,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: COLORS.DARK,
        margin: 0,
    },
    eventTitle: {
        fontSize: '16px',
        fontWeight: '500',
        color: COLORS.DARK,
        marginBottom: '25px',
        backgroundColor: COLORS.LIGHT,
        padding: '10px',
        borderRadius: '8px',
    },
    subTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: COLORS.PRIMARY,
        marginTop: '30px',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        color: COLORS.DANGER,
        fontSize: '20px',
        cursor: 'pointer',
    },
    content: {
        paddingBottom: '50px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    formRow: {
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
        flexWrap: 'wrap' as const,
    },
    formColumn: {
        flex: 1,
        minWidth: '250px', 
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: COLORS.DARK_NAVY,
        fontSize: '15px',
        alignItems: 'center',
    },
    icon: {
        marginRight: '8px',
        color: COLORS.PRIMARY,
        fontSize: '16px',
    },
    input: {
        width: '100%',
        padding: '12px',
        border: `1px solid ${COLORS.BORDER}`,
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
        backgroundColor: COLORS.WHITE, 
        color: COLORS.DARK_NAVY, 
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: `1px solid ${COLORS.BORDER}`,
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
        resize: 'vertical',
        backgroundColor: COLORS.WHITE, 
        color: COLORS.DARK_NAVY, 
    }, 
    select: {
        width: '100%',
        padding: '12px',
        border: `1px solid ${COLORS.BORDER}`,
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
        appearance: 'none',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        paddingRight: '30px',
        backgroundColor: COLORS.WHITE, 
        color: COLORS.DARK_NAVY, 
    },
    buttonContainer: { 
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '15px',
        marginTop: '30px',
    },
    
    // THÊM: Style cho nút khi đang chờ duyệt
    waitingButton: {
        width: '180px', 
        padding: '12px 15px',
        backgroundColor: COLORS.WARNING, 
        color: COLORS.DARK_NAVY,
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'not-allowed', 
        opacity: 0.9,
        transition: 'background-color 0.2s',
    },
    
    submitButton: {
        width: '180px',
        padding: '12px 15px',
        backgroundColor: COLORS.DARK_NAVY,
        color: COLORS.WHITE,
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    submitButtonHover: { 
        backgroundColor: COLORS.DANGER,
    },
    cancelButton: {
        width: '100px',
        padding: '12px 15px',
        backgroundColor: COLORS.SECONDARY,
        color: COLORS.WHITE,
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    skillsContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '10px',
        alignItems: 'center',
    },
    addButton: {
        padding: '10px 15px',
        backgroundColor: COLORS.PRIMARY,
        color: COLORS.WHITE,
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    tagsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        minHeight: '30px',
    },
    tag: {
        backgroundColor: COLORS.LIGHT,
        color: COLORS.PRIMARY, 
        border: `1px solid ${COLORS.PRIMARY}`,
        padding: '5px 10px',
        borderRadius: '15px',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
    },
    removeTagIcon: {
        marginLeft: '5px',
        fontSize: '10px',
        cursor: 'pointer',
        color: COLORS.TEXT_SECONDARY,
    }
};

const RegistrationForm: React.FC<RegistrationFormProps> = ({ event, roles, onClose }) => {
    
    const [registrationId, setRegistrationId] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false); 

    const initialRoleId = roles.length > 0 ? roles[0].id : '';
    
    const [formData, setFormData] = useState<FormData>({
        eventId: event.id,
        roleId: initialRoleId, 
        motivation: '',
        skills: event.requirements?.skills || [], 
        availability: '',
        experience: '',
        emergencyContact: {
            name: '',
            phone: '',
            relationship: '',
        },
    });

    const [skillInput, setSkillInput] = useState(''); 
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isSubmitHovered, setIsSubmitHovered] = useState(false); 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (!name.includes('.')) {
            setFormData(prev => ({ ...prev, [name]: value }));
        } 
        else {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                emergencyContact: { 
                    ...prev.emergencyContact,
                    [child]: value,
                },
            }));
        }
    };

    const handleAddSkill = () => {
        if (skillInput.trim() !== '' && !formData.skills.includes(skillInput.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skillInput.trim()],
            }));
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage(null); 
        
        // Ngăn chặn submit nếu đã đăng ký và đang chờ
        if (isRegistered) {
            setStatusMessage({ type: 'error', message: 'Bạn đã gửi đơn đăng ký. Vui lòng chờ xét duyệt.' });
            return;
        }

        const apiUrl = 'http://localhost:8000/registrations/apply';
        const authToken = localStorage.getItem("accessToken"); 

        console.log(authToken);
        if (!authToken) {
             setStatusMessage({ 
                 type: 'error', 
                 message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại để đăng ký.' 
             });
             return;
        }

        const payload = {
            eventId: formData.eventId,
            roleId: formData.roleId,
            motivation: formData.motivation,
            skills: formData.skills,
            availability: formData.availability,
            experience: formData.experience,
            emergencyContact: formData.emergencyContact,
        };
        
        try {
            console.log("Submitting Payload:", payload); 
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`, 
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                setStatusMessage({ 
                    type: 'error', 
                    message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' 
                });
                setTimeout(onClose, 2000); 
                return;
            }

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || `Lỗi HTTP: ${response.status}`);
            }

            const newRegistrationId = result.data.id;
            setRegistrationId(newRegistrationId); 
            setIsRegistered(true); // Chuyển trạng thái sang Đang Chờ Xét Duyệt

            localStorage.setItem("lastRegistrationId", newRegistrationId); 

            setStatusMessage({ 
                type: 'success', 
                message: `Đăng ký thành công! Đơn của bạn đang được xét duyệt. Mã: ${result.data.registrationCode}` 
            });
            

        } catch (error) {
            console.error("Lỗi khi đăng ký:", error);
            setStatusMessage({ 
                type: 'error', 
                message: `Đăng ký không thành công. Chi tiết: ${error instanceof Error ? error.message : 'Lỗi không xác định'}` 
            });
        }
    };

    const submitButtonStyle = isRegistered 
        ? formStyles.waitingButton
        : { 
            ...formStyles.submitButton, 
            ...(isSubmitHovered ? formStyles.submitButtonHover : {}) 
          };
    
    const submitButtonText = isRegistered 
        ? "Đang Chờ Xét Duyệt..." 
        : "Gửi Đăng Ký";


    return (
        <div style={formStyles.container}>
            <div style={formStyles.header}>
                <h2 style={formStyles.title}>Đăng Ký Tình Nguyện Viên</h2>
                <button onClick={onClose} style={formStyles.closeButton}>
                    <FaTimes />
                </button>
            </div>
            
            {statusMessage && (
                <div 
                    style={{
                        ...formStyles.statusBox, 
                        backgroundColor: statusMessage.type === 'success' ? COLORS.SUCCESS : (statusMessage.type === 'error' ? COLORS.WARNING : COLORS.DANGER),
                        color: statusMessage.type === 'error' ? COLORS.DARK_NAVY : COLORS.WHITE,
                    }}
                >
                    {statusMessage.type === 'success' ? (
                        <FaCheckCircle style={{ marginRight: '8px' }} />
                    ) : statusMessage.type === 'error' ? (
                        <FaHourglassHalf style={{ marginRight: '8px' }} />
                    ) : (
                        <FaExclamationTriangle style={{ marginRight: '8px' }} />
                    )}
                    {statusMessage.message}
                </div>
            )}

            <p style={formStyles.eventTitle}>Sự kiện: {event.title}</p>
            <div style={formStyles.content}>
                <form onSubmit={handleSubmit}>
                    
                    {/* ... (Phần 1, 2, 3, 4 giữ nguyên) ... */}
                    
                    <div style={formStyles.formGroup}>
                        <label style={formStyles.label} htmlFor="roleId">
                            <FaUserShield style={formStyles.icon} /> Vị trí đăng ký: *
                        </label>
                        <select 
                            style={formStyles.select}
                            name="roleId" 
                            value={formData.roleId} 
                            onChange={handleChange}
                            required
                            disabled={roles.length === 0 || isRegistered} // Disabled khi đã đăng ký
                        >
                            {roles.length === 0 && <option value="" disabled>Không có vai trò nào khả dụng</option>}
                            {roles.map(role => (
                                <option key={role.id} value={role.id} disabled={role.slots - role.filled <= 0 || isRegistered}>
                                    {role.name} ({role.slots - role.filled} vị trí trống)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={formStyles.formGroup}>
                        <label style={formStyles.label} htmlFor="motivation">
                            <FaHeart style={formStyles.icon} /> Động lực tham gia: *
                        </label>
                        <textarea
                            style={formStyles.textarea}
                            name="motivation"
                            value={formData.motivation}
                            onChange={handleChange}
                            placeholder="Hãy chia sẻ lý do bạn muốn tham gia sự kiện này (tối đa 250 ký tự)"
                            maxLength={250}
                            rows={3}
                            required
                            disabled={isRegistered} // Disabled khi đã đăng ký
                        />
                    </div>
                    
                    <div style={formStyles.formRow}>
                        <div style={formStyles.formColumn}>
                            <label style={formStyles.label} htmlFor="experience">
                                <FaHandsHelping style={formStyles.icon} /> Kinh nghiệm tình nguyện: *
                            </label>
                            <input
                                style={formStyles.input}
                                type="text"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                placeholder="Ví dụ: 2 năm kinh nghiệm tình nguyện"
                                required
                                disabled={isRegistered} // Disabled khi đã đăng ký
                            />
                        </div>
                        <div style={formStyles.formColumn}>
                             <label style={formStyles.label} htmlFor="availability">
                                 <FaCalendarAlt style={formStyles.icon} /> Thời gian có thể tham gia:
                             </label>
                             <input
                                 style={formStyles.input}
                                 type="text"
                                 name="availability"
                                 value={formData.availability}
                                 onChange={handleChange}
                                 placeholder="Ví dụ: Cuối tuần, Buổi tối, Full-time..."
                                 disabled={isRegistered} // Disabled khi đã đăng ký
                             />
                        </div>
                    </div>
                    
                    <div style={formStyles.formGroup}>
                        <label style={formStyles.label} htmlFor="skillsInput">
                            <FaCheckCircle style={formStyles.icon} /> Kỹ năng bổ sung: 
                        </label>
                        <div style={formStyles.skillsContainer}>
                            <input
                                style={{ ...formStyles.input, flex: 1, marginBottom: 0 }}
                                type="text"
                                id="skillsInput"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                placeholder="Nhập kỹ năng (ví dụ: Hồi sức cấp cứu) và nhấn Enter hoặc Thêm"
                                disabled={isRegistered} // Disabled khi đã đăng ký
                            />
                            <button type="button" onClick={handleAddSkill} style={formStyles.addButton} disabled={isRegistered}>
                                Thêm
                            </button>
                        </div>
                        <div style={formStyles.tagsContainer}>
                            {formData.skills.map((skill) => (
                                <span key={skill} style={formStyles.tag}>
                                    {skill}
                                    {!isRegistered && ( // Chỉ cho phép xóa khi chưa đăng ký
                                        <FaTimes 
                                            style={formStyles.removeTagIcon} 
                                            onClick={() => handleRemoveSkill(skill)} 
                                        />
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    <h3 style={formStyles.subTitle}><FaPhoneVolume style={formStyles.icon} /> Liên Hệ Khẩn Cấp</h3>
                    
                    <div style={formStyles.formRow}>
                        <div style={formStyles.formColumn}>
                            <label style={formStyles.label} htmlFor="emergencyContact.name">Tên người liên hệ: *</label>
                            <input
                                style={formStyles.input}
                                type="text"
                                name="emergencyContact.name"
                                id="emergencyContact.name"
                                value={formData.emergencyContact.name}
                                onChange={handleChange}
                                required
                                disabled={isRegistered} // Disabled khi đã đăng ký
                            />
                        </div>
                        <div style={formStyles.formColumn}>
                            <label style={formStyles.label} htmlFor="emergencyContact.phone">Số điện thoại: *</label>
                            <input
                                style={formStyles.input}
                                type="tel"
                                name="emergencyContact.phone"
                                id="emergencyContact.phone"
                                value={formData.emergencyContact.phone}
                                onChange={handleChange}
                                required
                                disabled={isRegistered} // Disabled khi đã đăng ký
                            />
                        </div>
                    </div>
                    
                    <div style={formStyles.formGroup}>
                        <label style={formStyles.label} htmlFor="emergencyContact.relationship">Mối quan hệ:</label>
                        <input
                            style={formStyles.input}
                            type="text"
                            name="emergencyContact.relationship"
                            id="emergencyContact.relationship"
                            value={formData.emergencyContact.relationship}
                            onChange={handleChange}
                            placeholder="Ví dụ: Bố, Mẹ, Bạn bè..."
                            disabled={isRegistered} // Disabled khi đã đăng ký
                        />
                    </div>

                    {/* KHU VỰC BUTTONS */}
                    <div style={formStyles.buttonContainer}>
                        <button 
                            type="submit" 
                            style={submitButtonStyle}
                            onMouseEnter={() => setIsSubmitHovered(true)}
                            onMouseLeave={() => setIsSubmitHovered(false)}
                            disabled={roles.length === 0 || isRegistered} // Disabled khi đã đăng ký hoặc không có vai trò
                        >
                            {submitButtonText}
                        </button>
                        <button type="button" onClick={onClose} style={formStyles.cancelButton}>
                            Đóng Form
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;