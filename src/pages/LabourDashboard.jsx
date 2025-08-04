import React from 'react';
import { useNavigate } from 'react-router-dom';
import fingerprint from '../assets/fingerprint.png';
import layer2 from '../assets/calendar.png';
import logo from '../assets/logo.png';
import avatar from '../assets/user.png';
const LabourDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white p-4 pb-8 max-w-full mx-auto w-full">
      {/* Header */}
      <div className="flex justify-evenly items-center mb-4">
        {/* <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-700 shadow">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div> */}
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="w-25 h-20" />
          <button
            onClick={handleLogout}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <p className="text-center text-gray-800 font-semibold mb-6 text-lg uppercase">
        Hi, {user?.name || 'User'}
      </p>

      {/* Grid Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <DashboardCard
          label="Mark Attendance"
          icon={fingerprint}
          onClick={() => navigate('/punch')}
        />
        <DashboardCard
          label="My Attendance"
          icon={layer2}
          onClick={() => navigate('/my-attendance')}
        />
        <DashboardCard
          label="Profile"
          icon={avatar}
          onClick={() => navigate('/profile')}
        />
      </div>
    </div>
  );
};

const DashboardCard = ({ label, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-gray-100 p-6 rounded-lg shadow text-center cursor-pointer hover:bg-gray-200 transition"
  >
    <img src={icon} alt={label} className="w-12 h-12 mx-auto mb-2" />
    <p className="font-medium text-gray-800">{label}</p>
  </div>
);

export default LabourDashboard;
