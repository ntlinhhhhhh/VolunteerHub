import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const LoginSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy giá trị token từ URL (?token=...)
    const token = searchParams.get('token');

    if (token) {
      // Lưu vào localStorage
      localStorage.setItem("accessToken", token);
      console.log("Token saved successfully");

      // Chuyển hướng về dashboard
      navigate("/volunteer/dashboard");
    } else {
      console.error("No token found, redirecting to login");
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang xác thực tài khoản...</div>;
};

export default LoginSuccess;