import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './AdminDashboard'; // admin dashboard
import LabourDashboard from './LabourDashboard';

const RoleBasedDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role;

  if (role === 'admin') return <Dashboard />;
  if (role === 'labour' || role === 'subcontractor') return <LabourDashboard />;

  return <div>❌ Unknown role: {role}</div>;
};

export default RoleBasedDashboard;
