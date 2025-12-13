import React, { useState } from "react";
import { FaPaperPlane } from 'react-icons/fa'; // Chỉ giữ lại icon cần thiết

interface ForgotPasswordStyles {
    [key: string]: React.CSSProperties;
}

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:8000/auth/forgot-password", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMessage({ 
                    type: 'success', 
                    text: `✅ Reset link sent to ${email}. Check your inbox!` 
                });
            } else {
                setMessage({ 
                    type: 'error', 
                    text: data.message || "❌ Failed to send reset link. Check your email." 
                });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "❌ Network error. Cannot connect to the server." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.fullPageContainer}>
            <div style={styles.cardContainer}>
                <h1 style={styles.title}>Forgot Password</h1>
                <p style={styles.subtitle}>Enter your email to receive the password reset link.</p>

                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <label style={styles.label}>Email Address</label>
                    <input
                        type="email"
                        required
                        placeholder="e.g. yourname@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        disabled={isLoading}
                    />

                    <button type="submit" style={styles.primaryButton} disabled={isLoading}>
                        <FaPaperPlane style={{ marginRight: '8px' }} />
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                {message.text && (
                    <p style={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
                        {message.text}
                    </p>
                )}
            </div>
        </div>
    );
};

// --- STYLES ĐÃ ĐƯỢC CHỈNH SỬA CHO FULL SCREEN ---
const styles: ForgotPasswordStyles = {
    fullPageContainer: {
        // --- CHỈNH SỬA ĐỂ CHIẾM TOÀN BỘ VIEWPORT ---
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh", // Chiều cao tối thiểu là 100% viewport height
        width: "100vw",     // Chiều rộng là 100% viewport width
        backgroundColor: "#f4f7fa",
        fontFamily: 'Arial, sans-serif',
    },
    cardContainer: {
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
    title: {
        fontSize: '28px', // Tăng kích thước font cho desktop
        fontWeight: '700',
        color: '#343a40',
        marginBottom: '15px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#6c757d',
        marginBottom: '30px', // Tăng khoảng cách
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
        marginBottom: "25px",
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
        fontSize: '18px', // Tăng font button
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
    }
};


export default ForgotPassword;