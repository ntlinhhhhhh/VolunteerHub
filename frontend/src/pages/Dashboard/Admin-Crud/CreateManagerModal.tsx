import React, { useState } from 'react';
import { FaUserPlus, FaTimes, FaEnvelope, FaUser, FaLock, FaAddressCard } from 'react-icons/fa';

const COLORS = {
    PRIMARY: '#1A73E8',
    BORDER: '#EBEBEB',
    TEXT_SECONDARY: '#5F6368',
    WHITE: '#FFFFFF',
    DANGER: '#EA4335',
    DARK_NAVY: '#202124',
    BLACK: '#000000',
};

interface CreateManagerModalProps {
    onClose: () => void;
    onSuccess: (message: string) => void;
}

const CreateManagerModal: React.FC<CreateManagerModalProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        fullName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Kiểm tra độ dài mật khẩu trước khi gọi API
        if (formData.password.length < 8) {
            setError("Mật khẩu phải có ít nhất 8 ký tự.");
            return;
        }

        setLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch("http://localhost:8000/auth/admin/create-event-maanager", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            
            if (res.ok && result.success) {
                onSuccess(result.message || "Event-manager created successfully!");
                onClose();
            } else {
                setError(result.message || "Failed to create manager");
            }
        } catch (err) {
            setError("Lỗi kết nối mạng, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <div style={modalStyles.header}>
                    <h2 style={modalStyles.title}>
                        <FaUserPlus style={{ marginRight: '10px', color: COLORS.PRIMARY }} /> 
                        Create New Manager
                    </h2>
                    <button onClick={onClose} style={modalStyles.closeIconButton}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={modalStyles.form}>
                    {/* Hiển thị lỗi nếu có */}
                    {error && <div style={modalStyles.errorBadge}>{error}</div>}

                    <div style={modalStyles.inputGroup}>
                        <label style={modalStyles.label}>Full Name</label>
                        <div style={modalStyles.inputWrapper}>
                            <FaAddressCard style={modalStyles.icon} />
                            <input
                                type="text"
                                required
                                style={modalStyles.input}
                                placeholder="e.g. Nguyễn Kim Yến"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={modalStyles.inputGroup}>
                        <label style={modalStyles.label}>Username</label>
                        <div style={modalStyles.inputWrapper}>
                            <FaUser style={modalStyles.icon} />
                            <input
                                type="text"
                                required
                                style={modalStyles.input}
                                placeholder="kimyen"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={modalStyles.inputGroup}>
                        <label style={modalStyles.label}>Email Address</label>
                        <div style={modalStyles.inputWrapper}>
                            <FaEnvelope style={modalStyles.icon} />
                            <input
                                type="email"
                                required
                                style={modalStyles.input}
                                placeholder="yenkim@gmail.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={modalStyles.inputGroup}>
                        <label style={modalStyles.label}>Password</label>
                        <div style={modalStyles.inputWrapper}>
                            <FaLock style={modalStyles.icon} />
                            <input
                                type="password"
                                required
                                style={modalStyles.input}
                                placeholder="Tối thiểu 8 ký tự"
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    if (error) setError(null); // Xóa lỗi khi người dùng bắt đầu nhập lại
                                }}
                            />
                        </div>
                    </div>

                    <div style={modalStyles.footer}>
                        <button type="button" onClick={onClose} style={modalStyles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={modalStyles.submitBtn}>
                            {loading ? "Creating..." : "Create Manager"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const modalStyles = {
    overlay: { 
        position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', 
        justifyContent: 'center', alignItems: 'center', zIndex: 1000 
    },
    modal: { 
        backgroundColor: COLORS.WHITE, borderRadius: '12px', width: '90%', 
        maxWidth: '450px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', 
        overflow: 'hidden', border: `1px solid ${COLORS.BORDER}`
    },
    header: { 
        padding: '20px 25px', borderBottom: `1px solid ${COLORS.BORDER}`, 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
    },
    title: { 
        margin: 0, fontSize: '20px', color: COLORS.DARK_NAVY, 
        display: 'flex', alignItems: 'center', fontWeight: '500' 
    },
    closeIconButton: { 
        background: 'none', border: 'none', fontSize: '20px', 
        cursor: 'pointer', color: COLORS.TEXT_SECONDARY, display: 'flex', alignItems: 'center' 
    },
    form: { padding: '25px' },
    label: { 
        display: 'block', fontSize: '14px', fontWeight: '500', 
        marginBottom: '8px', color: COLORS.DARK_NAVY 
    },
    inputGroup: { marginBottom: '20px' },
    inputWrapper: { position: 'relative' as const, display: 'flex', alignItems: 'center' },
    icon: { position: 'absolute' as const, left: '12px', color: COLORS.TEXT_SECONDARY },
    input: { 
        width: '100%', padding: '12px 12px 12px 40px', borderRadius: '6px', 
        border: `1px solid ${COLORS.BORDER}`, fontSize: '15px',
        backgroundColor: COLORS.WHITE, 
        color: COLORS.BLACK,
        outline: 'none'
    },
    footer: { 
        marginTop: '30px', display: 'flex', 
        justifyContent: 'flex-end', gap: '12px', borderTop: `1px solid ${COLORS.BORDER}`,
        paddingTop: '20px'
    },
    cancelBtn: { 
        padding: '10px 24px', borderRadius: '6px', border: `1px solid ${COLORS.BORDER}`, 
        backgroundColor: COLORS.WHITE, cursor: 'pointer', 
        fontWeight: '400',
        color: COLORS.BLACK 
    },
    submitBtn: { 
        padding: '10px 24px', borderRadius: '6px', border: 'none', 
        backgroundColor: COLORS.PRIMARY, color: COLORS.WHITE, 
        fontWeight: '400',
        cursor: 'pointer' 
    },
    errorBadge: { 
        backgroundColor: '#FDE7E7', color: COLORS.DANGER, padding: '12px', 
        borderRadius: '6px', marginBottom: '20px', fontSize: '14px', 
        textAlign: 'center' as const, fontWeight: '400',
        border: '1px solid #F5C2C2'
    }
};

export default CreateManagerModal;