import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaLockOpen, FaArrowRight } from 'react-icons/fa';

interface ResetPasswordStyles {
    [key: string]: React.CSSProperties;
}

const ResetPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlEmail = params.get("email") || "";
        const urlToken = params.get("token") || "";

        setEmail(urlEmail);
        setToken(urlToken);

        if (!urlEmail || !urlToken) {
            setMessage({ type: 'error', text: "❌ Invalid or incomplete reset link." });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!email || !token) {
            setMessage({ type: 'error', text: "❌ Token or email is missing. Please use the full link sent to your email." });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "❌ Passwords do not match." });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:8000/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token, newPassword: newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ 
                    type: 'success', 
                    text: "✅ Password reset successfully! Redirecting to login..." 
                });
                
                setTimeout(() => {
                    navigate("/login"); 
                }, 2000);

            } else {
                setMessage({ 
                    type: 'error', 
                    text: data.message || "❌ Failed to reset password. The link might have expired." 
                });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "❌ Network error. Could not connect to the server." });
        } finally {
            setIsLoading(false);
        }
    };

    if (!email || !token) {
        return (
            <div style={styles.fullPageContainer}>
                <div style={styles.cardContainer}>
                    <h1 style={styles.title}>Error</h1>
                    <p style={styles.errorMessage}>{message.text}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.fullPageContainer}>
            <div style={styles.cardContainer}>
                <h1 style={styles.title}>Set New Password</h1>
                <p style={styles.subtitle}>Email: **{email}**</p>
                
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <label style={styles.label}>New Password (Min 8 characters)</label>
                    <input
                        type="password" required value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={styles.input} disabled={isLoading} minLength={8}
                    />

                    <label style={styles.label}>Confirm New Password</label>
                    <input
                        type="password" required value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={styles.input} disabled={isLoading} minLength={8}
                    />

                    <button type="submit" style={styles.primaryButton} disabled={isLoading}>
                        <FaLockOpen style={{ marginRight: '8px' }} />
                        {isLoading ? "Changing..." : "Reset Password"}
                    </button>
                </form>

                {message.text && (
                    <p style={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
                        {message.text}
                    </p>
                )}
                {message.type === 'success' && (
                    <div style={styles.loginLink} onClick={() => navigate("/login")}>
                        Go to Login <FaArrowRight style={{ marginLeft: '5px' }}/>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- STYLES ĐÃ ĐƯỢC CHỈNH SỬA CHO FULL SCREEN ---
const styles: ResetPasswordStyles = {
    fullPageContainer: {
        // --- Đảm bảo chiếm toàn bộ viewport ---
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh", // Chiều cao tối thiểu là 100% viewport height
        width: "100vw",     // Chiều rộng là 100% viewport width
        backgroundColor: "#f4f7fa",
        fontFamily: 'Arial, sans-serif',
        // Thiết lập body/root element trong CSS toàn cục (ví dụ: index.css)
        // để đảm bảo 100vh hoạt động đúng: html, body, #root { height: 100%; margin: 0; }
    },
    cardContainer: {
        // Container giữ form, giới hạn kích thước để form không quá lớn trên màn hình rộng
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: "450px", // Tăng nhẹ max width cho desktop
        width: '90%',
        padding: "40px",
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        textAlign: 'center',
    },
    // Giữ nguyên các styles khác
    title: {
        fontSize: '28px', // Tăng kích thước font cho desktop
        fontWeight: '700',
        color: '#343a40',
        marginBottom: '15px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#6c757d',
        marginBottom: '25px',
        fontWeight: 'bold'
    },
    label: {
        display: 'block',
        textAlign: 'left',
        fontSize: '14px',
        fontWeight: '600',
        color: '#495057',
        marginBottom: '5px',
    },
    input: {
        width: "100%",
        padding: "14px", // Tăng padding input
        marginBottom: "20px",
        border: '1px solid #ced4da',
        borderRadius: '8px',
        fontSize: '16px',
        boxSizing: 'border-box',
    },
    primaryButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: "100%",
        padding: "15px", // Tăng padding button
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: '18px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
    },
    errorMessage: {
        marginTop: "20px",
        color: "#dc3545",
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px'
    },
    successMessage: {
        marginTop: "20px",
        color: "#155724",
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px'
    },
    loginLink: {
        marginTop: '15px',
        color: '#007bff',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '15px',
        display: 'flex',
        alignItems: 'center',
    }
};

export default ResetPassword;