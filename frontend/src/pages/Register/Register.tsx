import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa'; 

interface RegistrationCredentials {
  fullName: string; 
  username: string; 
  email: string;
  password: string;
}

const Register: React.FC = () => {
    // CẬP NHẬT: Khởi tạo state với 'fullName' và 'username'
  const [credentials, setCredentials] = useState<RegistrationCredentials>({ 
    fullName: "", 
    username: "",
    email: "", 
    password: "" 
  });
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setLoading(true);
    setMessage("");

    if (!credentials.fullName || !credentials.username || !credentials.email || !credentials.password) {
      setMessage("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
        // CẬP NHẬT: Đảm bảo URL là http://localhost:8000
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Gửi đúng payload: email, username, fullName, password
        body: JSON.stringify({
            email: credentials.email,
            username: credentials.username,
            fullName: credentials.fullName,
            password: credentials.password,
        }),
      });

      const result = await res.json();
      
      // Xử lý response thành công
      if (res.ok && result.success) {
        setMessage(`Registration successful: ${result.message}. Redirecting to login...`);
        
        // LƯU Ý: Lưu trữ token sau khi đăng ký thành công (Tùy chọn)
        if (result.data?.accessToken) {
            localStorage.setItem("accessToken", result.data.accessToken);
            localStorage.setItem("refreshToken", result.data.refreshToken);
        }

        setTimeout(() => {
            navigate('/login');
        }, 2000);
      } else {
        setMessage(`Registration failed: ${result.message || "Unknown error"}`);
      }
      
    } catch (err) {
      setMessage("Error connecting to API or server error.");
    } finally {
      if(!message.includes("successful")) {
        setLoading(false);
      }
    }
  };


  return (
    <div style={styles.fullPageContainer}>
        <div style={styles.cardContainer}>
            
            {/* ICON FA ARROW LEFT (Nút quay lại trang chủ) */}
            <div 
                onClick={() => navigate('/')} 
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: '#343a40',
                    zIndex: 10,
                    lineHeight: '1',
                    padding: '5px'
                }}
            >
                <FaArrowLeft />
            </div>

            <h1 style={styles.title}>Join VolunteerHub!</h1>
            <p style={styles.subtitle}>Create your account to start making a real impact.</p>

            {/* Registration form */}
            <div style={{ width: "100%" }}>
                <input
                    type="text"
                    name="fullName" // CẬP NHẬT: dùng fullName
                    placeholder="Full Name"
                    value={credentials.fullName}
                    onChange={handleChange}
                    style={styles.input}
                />
                <input
                    type="text"
                    name="username" // THÊM MỚI: input username
                    placeholder="Username"
                    value={credentials.username}
                    onChange={handleChange}
                    style={styles.input}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={handleChange}
                    style={styles.input}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    style={styles.input}
                />
                <button
                    onClick={handleRegister}
                    style={styles.primaryButton}
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Get Started"}
                </button>

                {message && <p style={message.includes("failed") || message.includes("error") ? styles.errorMessage : styles.successMessage}>{message}</p>}
            </div>

            <div style={styles.linkText}>
                <p style={{ color: '#343a40' }}>Already have an account? <Link to="/login" style={styles.loginLink}>Log In</Link></p>
            </div>
        </div>
    </div>
  );
};

// --- Themed Styling (Giữ nguyên) ---
const styles: { [key: string]: React.CSSProperties } = {
    fullPageContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#f0f4f8", 
        fontFamily: 'Arial, sans-serif',
    },
    cardContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "18px", 
        maxWidth: "400px",
        width: '90%',
        padding: "45px", 
        backgroundColor: '#ffffff',
        borderRadius: '16px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
        textAlign: 'center',
        position: 'relative',
    },
    title: {
        fontSize: '28px',
        fontWeight: '600',
        color: '#343a40',
        marginBottom: '0px', 
    },
    subtitle: {
        fontSize: '16px',
        color: '#6c757d',
        marginBottom: '15px',
    },
    input: {
        width: "100%", 
        padding: "14px", 
        marginBottom: "15px", 
        border: '1px solid #ced4da',
        borderRadius: '8px',
        fontSize: '16px',
        boxSizing: 'border-box',
    },
    primaryButton: {
        width: "100%",
        padding: "14px",
        backgroundColor: "#007bff", 
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: '18px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
    },
    linkText: {
        marginTop: '25px',
        fontSize: '14px',
    },
    loginLink: {
        color: '#007bff', 
        textDecoration: 'none',
        fontWeight: 'bold',
    },
    errorMessage: {
        marginTop: "15px", 
        color: "#dc3545",
        fontSize: '14px'
    },
    successMessage: {
        marginTop: "15px", 
        color: "#28a745",
        fontSize: '14px'
    }
};

export default Register;