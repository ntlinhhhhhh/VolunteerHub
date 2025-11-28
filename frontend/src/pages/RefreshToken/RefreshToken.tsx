import React, { useState } from "react";

const RefreshToken: React.FC = () => {
  const [message, setMessage] = useState("");
  const [data, setData] = useState("");

  const handleRefresh = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      setMessage("No refresh token found. Please login first.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await res.json(); 

      if (res.ok && result.success) {
        setMessage("Token refreshed successfully!");
        setData(JSON.stringify(result.data)); 
        console.log("New tokens:", result.data);

        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("refreshToken", result.data.refreshToken);
      } else {
        setMessage(`Refresh failed: ${result.message}`);
        setData("ggggg");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Error connecting to API");
      setData("hdhhd");
    }
  };


  return (
    <div>
      <h2>Refresh Token</h2>
      <button onClick={handleRefresh}>Refresh Token</button>
      <p>{message}</p>
      <p>{data}</p>
    </div>
  );
};

export default RefreshToken;
