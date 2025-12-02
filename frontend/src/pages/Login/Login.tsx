import React, { useEffect, useState } from "react";

// Khai báo interface cho user Google
interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  sub: string; // Google user id
}

// Khai báo window.google để TypeScript không báo lỗi
declare global {
  interface Window {
    google: any;
  }
}

const GoogleLogin: React.FC = () => {
  const [user, setUser] = useState<GoogleUser | null>(null);

  // Callback khi Google trả về idToken
  const handleCredentialResponse = async (response: any) => {
    const idToken = response.credential as string;
    console.log("ID Token:", idToken);

    // Giải mã JWT để lấy thông tin user
    const base64Url = idToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const userObject: GoogleUser = JSON.parse(jsonPayload);
    setUser(userObject);

    // Gọi backend với idToken
    try {
      const res = await fetch("http://localhost:8000/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      console.log("Backend response:", data);
    } catch (err) {
      console.error("Error calling backend:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval);

        window.google.accounts.id.initialize({
          client_id: "546716717633-9ipq8qqrekc7rg9ha6dgtcu49okd67kt.apps.googleusercontent.com", // Thay bằng Client ID của bạn
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn")!,
          { theme: "outline", size: "large" }
        );

        window.google.accounts.id.prompt();
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div id="google-signin-btn"></div>

      {user && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <img src={user.picture} alt="Avatar" width="80" />
        </div>
      )}
    </div>
  );
};

//export default GoogleLogin;
interface UserCredentials {
  email: string;
  password: string;
}

// Type for login response
interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<UserCredentials>({ email: "", password: "" });
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Handle email/password login
  const handleEmailLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data: LoginResponse = await res.json();

      if (res.ok && data.accessToken) {
        setMessage("Login successful!");
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken || "");
      } else {
        setMessage(`Login failed: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      setMessage("Error connecting to API");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px",
        gap: "20px",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <h1>Welcome! Please Log In</h1>

      {/* Google Login */}
      <GoogleLogin />

      <div style={{ marginTop: "20px", width: "100%" }}>
        <p style={{ textAlign: "center" }}>Or login with email/password</p>

        {/* Email login form */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={credentials.email}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button
          onClick={handleEmailLogin}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p style={{ marginTop: "10px", color: message.includes("failed") ? "red" : "green" }}>{message}</p>}
      </div>

      {/* Placeholder for future login methods */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>Other login options coming soon...</p>
      </div>
    </div>
  );
};

export default Login;
