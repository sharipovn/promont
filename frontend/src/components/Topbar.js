import React from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoMdSettings } from "react-icons/io";
import NotificationCard from './NotificationCard'; // 👈 Qo‘shing
import { useAuth } from '../context/AuthProvider';


export default function Topbar({ sidebarVisible, toggleSidebar }) {

  const { user } = useAuth(); // 👈 access user info here
  console.log('user:',user)
  return (
    <div className="d-flex justify-content-between align-items-center px-3 py-2 mt-1" style={{ color: 'white' }}>
      
      {/* Left: Toggle + Search */}
      <div className="d-flex align-items-center gap-3">
        {/* Toggle Button */}
        <button
          className="btn btn-info rounded-circle d-flex align-items-center justify-content-center"
          onClick={toggleSidebar}
          style={{ width: 40, height: 40 }}
        >
          {sidebarVisible ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        {/* Search Input */}
        <div className="search-bar-wrapper d-flex align-items-center bg-white rounded-pill px-3">
            <FaSearch className="me-2 text-muted" />
            <input
                type="text"
                className="form-control border-0 p-0 search-input"
                placeholder="Search"
            />
        </div>

      </div>

      {/* Right: Icons + Profile */}
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex flex-column">
          <strong className="text-white">{user?.fio}</strong>
          <small className="text-muted text-white-50 fs-8" style={{ fontSize: '0.7rem' }}>{user?.position}</small>
        </div>
        <NotificationCard />
        <IoMdSettings />
      </div>

    </div>
  );
}
