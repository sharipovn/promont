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
        <img
          src={logo}
          alt="Logo"
          className="img-fluid mx-auto mb-2"
          style={{
            width: '15vw',
            height: '15vw',
            maxWidth: '80px',
            maxHeight: '80px',
            objectFit: 'contain',
          }}
        />
        <h5 className="text-info fw-bold mb-4">Promont</h5>
      </div>





      {/* Navigation Links */}
      <ul className="nav flex-column" >
        <li className="nav-item mt-1  mx-3">
            <NavLink
              to="/dashboard"
              className="sidebar-link d-flex align-items-center gap-2"
              style={{
                color: '#344767',
                fontSize: 'clamp(0.85rem, 1vw + 0.4rem, 1.1rem)',
              }}
            >
              <RxDesktop style={{ fontSize: 'clamp(1rem, 1vw + 0.5rem, 1.4rem)' }} />
              <span>Home</span>
            </NavLink>
          </li>

         {hasCapability(PERMISSIONS.CAN_CREATE_PROJECT) && (
            <li className="nav-item mt-1 mx-3">
              <NavLink to="/create-project" className="sidebar-link d-flex align-items-center gap-2" 
                  style={{
                    color: '#344767',
                    fontSize: 'clamp(0.85rem, 1vw + 0.4rem, 1.1rem)',
                  }}>
                <SiOpenproject style={{ fontSize: 'clamp(1rem, 1vw + 0.5rem, 1.4rem)' }}/>
                <span>Create Project</span>
              </NavLink>
            </li>
         )}
        <li className="nav-item mt-1">
          <NavLink to="/users" className="sidebar-link" >
            👥 Users
          </NavLink>
        </li>
        <li className="nav-item mt-1">
          <NavLink to="/settings" className="sidebar-link">
            ⚙️ Settings
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
