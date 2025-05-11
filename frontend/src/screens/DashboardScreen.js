import React, { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import NoAccessScreen from './NoAccessScreen';

export default function DashboardScreen() {
  const { user, logout, hasCapability } = useAuth();
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  if (!hasCapability('CAN_VIEW')) {
    return <NoAccessScreen />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        {sidebarVisible && (
          <div style={{ width: '20%', transition: 'width 0.3s ease' }}>
            <Sidebar />
          </div>
        )}

        {/* Main Content Area */}
        <div
          className="flex-grow-1 d-flex flex-column az aligne-items-start"
          style={{ transition: 'margin-left 0.3s ease', width: sidebarVisible ? '80%' : '100%',height:'95vh' }}
        >
          {/* Topbar */}
          <Topbar
            sidebarVisible={sidebarVisible}
            toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          />

          {/* Main Page Content */}
          <div className="p-4">
            <h2>Welcome, {user?.fio}</h2>
            <p>Your role: {user?.role}</p>

            <div className="alert alert-info mt-3">
              ✅ You have permission to view users!
            </div>

            <button className="btn btn-secondary mt-4" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
