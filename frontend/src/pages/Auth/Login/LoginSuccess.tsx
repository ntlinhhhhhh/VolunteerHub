// import React, { useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';

// const LoginSuccess: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const [token, setToken] = useState<string | null>(null);

//   useEffect(() => {
//     const t = searchParams.get('token');
//     if (t) setToken(t);
//   }, [searchParams]);

//   return (
//     <div style={{ textAlign: 'center', marginTop: '50px' }}>
//       <h1>Login Success</h1>
//       {token ? (
//         <div>
//           <p>Your access token:</p>
//           <textarea readOnly value={token} style={{ width: '400px', height: '100px' }} />
//         </div>
//       ) : (
//         <p>No token found</p>
//       )}
//     </div>
//   );
// };

// export default LoginSuccess;
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

    // Save token
    localStorage.setItem("accessToken", token);

    // Decode token payload
    let payload: any = null;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      console.error("Failed to decode token", e);
    }

    const role = payload?.roleName || "volunteer"; // fallback

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
