import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // Import React Icon

interface GoogleUser {
    name: string;
    email: string;
    picture: string;
    sub: string;
}

declare global {
    interface Window {
        google: any;
    }
}

interface UserCredentials {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const [credentials, setCredentials] = useState<UserCredentials>({ email: "", password: "" });
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleGoogleLogin = () => {
        const clientId = '546716717633-9ipq8qqrekc7rg9ha6dgtcu49okd67kt.apps.googleusercontent.com';
        const redirectUri = 'http://localhost:8000/auth/google/callback';
        const scope = 'email profile openid';
        const responseType = 'code';
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&prompt=consent`;

        const googleUrl =
            `https://accounts.google.com/o/oauth2/v2/auth` +
            `?client_id=${clientId}` +
            `&redirect_uri=${redirectUri}` +
            `&response_type=code` +
            `&scope=${scope}` +
            `&prompt=consent`;

        window.location.href = googleUrl;
    };

    const handleEmailLogin = async () => {
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });

            const result = await res.json();

            if (res.ok && result.success && result.data?.accessToken) {
                setMessage("Login successful!");
                localStorage.setItem("accessToken", result.data.accessToken);
                localStorage.setItem("refreshToken", result.data.refreshToken);

                navigate("/volunteer/dashboard");
            } else {
                setMessage(`Login failed: ${result.message || "Unknown error"}`);
            }

        } catch (err) {
            setMessage("Error connecting to API");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.fullPageContainer}>
            <div style={styles.cardContainer}>

                {/* Back button */}
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

                <h1 style={styles.title}>Sign In to VolunteerHub</h1>
                <p style={styles.subtitle}>Welcome back! Enter your credentials to continue.</p>

                <button 
                    onClick={handleGoogleLogin}
                    style={styles.googleButton}
                >
                    Login with Google
                </button>

                <div style={styles.divider}>
                    <span style={styles.dividerText}>OR</span>
                </div>

                {/* Email login form */}
                <div style={{ width: "100%" }}>
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
                        onClick={handleEmailLogin}
                        style={styles.primaryButton}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    {message && (
                        <p style={
                            message.includes("failed") ? styles.errorMessage : styles.successMessage
                        }>
                            {message}
                        </p>
                    )}
                </div>

                <div style={{ width: "100%", textAlign: "right", marginBottom: "10px" }}>
                    <Link to="/forgot-password" style={styles.forgotPasswordLink}>
                        Forgot password?
                    </Link>
                </div>

                <div style={styles.linkText}>
                    <p style={{ color: '#343a40' }}>
                        Don't have an account? 
                        <Link to="/register" style={styles.registerLink}> Register Now</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

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
    divider: {
        width: "100%",
        textAlign: "center",
        borderBottom: "1px solid #dee2e6",
        lineHeight: "0.1em",
        margin: "25px 0 20px 0",
    },
    dividerText: {
        background: "#fff",
        padding: "0 10px",
        color: "#adb5bd",
        fontSize: "14px",
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
    registerLink: {
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

export default Login;