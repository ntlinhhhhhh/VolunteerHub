import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/google/callback?code=${code}`, {
      method: 'GET', 
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('JWT from backend:', data);

        localStorage.setItem('token', data.accessToken);

        navigate('/dashboard');
      })
      .catch(err => {
        console.error('Google login failed:', err);
        alert(err);
      });
  }, []);

  return <div>Logging in with Google...</div>;
};

export default GoogleCallback;
