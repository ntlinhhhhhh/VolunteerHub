import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaSignInAlt } from 'react-icons/fa';

// --- BẢNG MÀU ĐỒNG BỘ VỚI DASHBOARD (GOOGLE-LIKE) ---
const COLORS = {
    PRIMARY: '#1A73E8', // Màu Xanh Google/Accent chính
    DARK_NAVY: '#202124', // Màu chữ đậm
    BACKGROUND: '#F8F9FA', // Nền siêu sáng (Nền trang Login)
    CARD_BG: '#FFFFFF', // Nền Card (Form Login)
    BORDER: '#EBEBEB', // Đường viền mỏng
    TEXT_SECONDARY: '#5F6368', // Màu chữ phụ
    DANGER: '#EA4335', // Đỏ (Error)
    SUCCESS_ACCENT: '#34A853', // Xanh Lá (Success)
};

interface LoginStyles {
    [key: string]: React.CSSProperties;
}

const LoginAdmin: React.FC = () => {
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [message, setMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:8000/auth/admin/login", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                localStorage.setItem('role', 'admin');
                
                setMessage({ 
                    type: 'success', 
                    text: data.message || "✅ Admin login successful. Redirecting..." 
                });
                
                setTimeout(() => {
                    navigate("/admin/dashboard"); 
                }, 1500);

            } else {
                setMessage({ 
                    type: 'error', 
                    text: data.message || "❌ Login failed. Check credentials." 
                });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "❌ Network error. Cannot connect to the server." });
        } finally {
            setIsLoading(false);
        }
    };

    const getMessageStyle = () => {
        if (message.type === 'success') return styles.successMessage;
        if (message.type === 'error') return styles.errorMessage;
        return {};
    };

    return (
        <div style={styles.fullPageContainer}>
            <div style={styles.cardContainer}>
                <FaUserShield size={40} style={{ color: COLORS.PRIMARY, marginBottom: '15px' }} />
                <h1 style={styles.title}>Admin Portal Login</h1>
                <p style={styles.subtitle}>Use your administrative credentials to access the system.</p>

                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    {/* Input Email */}
                    <label style={styles.label}>Email</label>
                    <input
                        type="email" required placeholder="Enter admin email"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        style={styles.input} disabled={isLoading}
                    />

                    {/* Input Password */}
                    <label style={styles.label}>Password</label>
                    <input
                        type="password" required placeholder="Enter password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        style={{ ...styles.input, marginBottom: '35px' }} disabled={isLoading}
                    />

                    <button type="submit" style={styles.primaryButton} disabled={isLoading}>
                        <FaSignInAlt style={{ marginRight: '8px' }} />
                        {isLoading ? "Logging in..." : "Login as Admin"}
                    </button>
                </form>

                {message.text && (
                    <p style={getMessageStyle()}>
                        {message.text}
                    </p>
                )}
            </div>
        </div>
    );
};

// --- STYLES MỚI: TỐI GIẢN & ĐỒNG BỘ GOOGLE-LIKE ---
const styles: LoginStyles = {
    fullPageContainer: {
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", width: "100vw",
        backgroundColor: COLORS.BACKGROUND, // Nền sáng đồng bộ
        fontFamily: 'Roboto, Arial, sans-serif', color: COLORS.DARK_NAVY,
    },
    cardContainer: {
        display: "flex", flexDirection: "column", alignItems: "center",
        maxWidth: "450px", width: '90%', padding: "40px",
        backgroundColor: COLORS.CARD_BG, 
        borderRadius: '8px', // Bo tròn nhẹ nhàng
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // Shadow Google nhẹ
        textAlign: 'center', 
        border: `1px solid ${COLORS.BORDER}`, 
    },
    title: {
        fontSize: '28px', fontWeight: '400', // Font nhẹ nhàng hơn
        color: COLORS.DARK_NAVY, marginBottom: '10px',
    },
    subtitle: {
        fontSize: '15px', color: COLORS.TEXT_SECONDARY,
        marginBottom: '30px', fontWeight: '400',
    },
    label: {
        display: 'block', textAlign: 'left',
        fontSize: '14px', fontWeight: '500',
        color: COLORS.TEXT_SECONDARY, marginBottom: '5px',
    },
    input: {
        width: "100%", padding: "12px 15px", marginBottom: "20px",
        backgroundColor: COLORS.CARD_BG, color: COLORS.DARK_NAVY,
        border: `1px solid ${COLORS.BORDER}`, 
        borderRadius: '4px',
        fontSize: '16px', boxSizing: 'border-box',
        outline: 'none', // Thêm hiệu ứng focus
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    primaryButton: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: "100%", padding: "14px",
        backgroundColor: COLORS.PRIMARY, 
        color: COLORS.CARD_BG, border: "none", borderRadius: "4px",
        cursor: "pointer", fontSize: '16px', fontWeight: '500',
        transition: 'background-color 0.3s',
    },
    // Hiệu ứng Hover cho nút
    // Lưu ý: Trong React Inline Style, bạn không thể tạo trạng thái :hover trực tiếp,
    // nhưng bạn có thể thêm logic JavaScript nếu cần.
    
    // Message Styles đồng bộ với badge trong Dashboard
    errorMessage: {
        marginTop: "20px", 
        color: COLORS.DANGER, 
        backgroundColor: '#FCE8E6', // Màu nền nhẹ của Danger
        border: `1px solid ${COLORS.DANGER}`,
        padding: '12px', borderRadius: '4px', fontSize: '14px',
    },
    successMessage: {
        marginTop: "20px", 
        color: COLORS.SUCCESS_ACCENT,
        backgroundColor: '#E6F4EA', // Màu nền nhẹ của Success
        border: `1px solid ${COLORS.SUCCESS_ACCENT}`,
        padding: '12px', borderRadius: '4px', fontSize: '14px',
    }
};

export default LoginAdmin;