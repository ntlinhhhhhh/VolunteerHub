import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const LoginSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      console.error("No token found in URL");
      navigate("/login");
      return;
    }

    localStorage.setItem("accessToken", token);

    let payload: any = null;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      console.error("Failed to decode token", e);
    }

    const role = payload?.roleName || "volunteer";

    console.log("ROLE DETECTED:", role);

    
      navigate("/dashboard");
    

  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      Redirecting to your dashboard...
    </div>
  );
};

export default LoginSuccess;
