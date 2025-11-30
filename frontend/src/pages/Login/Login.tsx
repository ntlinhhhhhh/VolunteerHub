// import { useState } from "react";

// function App() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [data, setData] = useState(null);

//   const handleLogin = async () => {
//     try {
//       const response = await fetch("http://localhost:8000/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();
//       setData(data);

//       if (response.ok) {
//         setMessage("Login successful!");
//         localStorage.setItem("accessToken", data.accessToken);
//         localStorage.setItem("refreshToken", data.refreshToken);

//         console.log("Access token:", data.accessToken);
//         console.log("Refresh token:", data.refreshToken);
//       } else {
//         setMessage(`Login failed: ${data.message}`);
//       }
//     } catch (err) {
//       setMessage("Error connecting to API");
//       console.error(err);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Login</h1>
//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <button onClick={handleLogin}>Login</button>
//       <p>{message}</p>
//       <pre>{data && JSON.stringify(data, null, 2)}</pre>
//     </div>
//   );
// }

// export default App;

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
      <h2>Login Google + Gọi Backend</h2>
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

export default GoogleLogin;
