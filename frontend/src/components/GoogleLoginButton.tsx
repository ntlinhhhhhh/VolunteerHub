import React from 'react';

const GoogleLoginButton = () => {
  const handleLogin = () => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'openid',
        'email',
        'profile'
      ].join(' '),
    };

    const qs = new URLSearchParams(options).toString();
    window.location.href = `${rootUrl}?${qs}`;
  };

  return (
    <button onClick={handleLogin} style={{ padding: '8px 16px', fontSize: '16px' }}>
      Login with Google
    </button>
  );
};

export default GoogleLoginButton;
