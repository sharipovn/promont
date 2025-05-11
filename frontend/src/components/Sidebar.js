import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/icons/logo.png'; // Replace with your actual path
import { RxDesktop } from "react-icons/rx";
import { SiOpenproject } from "react-icons/si";
import { useAuth } from '../context/AuthProvider';
import { PERMISSIONS } from '../constants/permissions'; // 👈 import permissions



export default function Sidebar() {
  const { hasCapability } = useAuth();
  return (
    <div
      className="sidebar d-flex flex-column justify-content-start p-3 shadow"
      style={{
        height: '95vh',
        backgroundColor: '#ffffff',
        borderRadius: '25px',
        margin: '10px',
      }}
    >
      {/* Logo & Title */}
      <div className="text-center">
        <img src={logo} alt="Logo" style={{ height: '40px', marginBottom: '10px' }} />
        <h5 className="text-info fw-bold mb-4">Promont</h5>
      </div>

      {/* Navigation Links */}
      <ul className="nav flex-column" >
        <li className="nav-item mt-1">
          <NavLink to="/dashboard" className="sidebar-link d-flex align-items-center gap-2" style={{ color: '#344767' }}>
            <RxDesktop />
            <span>Home</span>
          </NavLink>
        </li>
         {hasCapability(PERMISSIONS.CAN_CREATE_PROJECT) && (
            <li className="nav-item mt-1">
              <NavLink to="/projects" className="sidebar-link d-flex align-items-center gap-2" style={{ color: '#344767' }}>
                <SiOpenproject />
                <span>Create Project</span>
              </NavLink>
            </li>
         )}
        <li className="nav-item">
          <NavLink to="/users" className="sidebar-link">
            👥 Users
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/settings" className="sidebar-link">
            ⚙️ Settings
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
