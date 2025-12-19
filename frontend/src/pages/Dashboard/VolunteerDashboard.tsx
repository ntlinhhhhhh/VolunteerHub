import React from 'react';
import { useNavigate } from 'react-router-dom';
import VolunteerDashboard from '../../components/features/volunteer/VolunteerDashboard';

const VolunteerDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return <VolunteerDashboard onLogout={handleLogout} />;
};

export default VolunteerDashboardPage;