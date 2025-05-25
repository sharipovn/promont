import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/icons/logo.png'; // Replace with your actual path
import { RxDesktop } from "react-icons/rx";
import { SiOpenproject } from "react-icons/si";
import { useAuth } from '../context/AuthProvider';
import { PERMISSIONS } from '../constants/permissions'; // 👈 import permissions
import { PiTreeStructureBold } from "react-icons/pi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { FaListCheck } from "react-icons/fa6";
import { SiTheboringcompany } from "react-icons/si";
import { useI18n } from '../context/I18nProvider';
import { LuLanguages } from "react-icons/lu";



export default function Sidebar() {
  const { hasCapability } = useAuth();
  const {returnTitle } = useI18n(); // ✅ include returnTitle
  return (
    <div
      className="sidebar d-flex flex-column justify-content-start p-3 shadow"
      style={{
        height: '95vh',
        backgroundColor: '#ffffff',
        borderRadius: '25px',
        margin: '10px',
        userSelect:'none',
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
                fontSize: 'clamp(0.85rem, 1vw + 0.4rem, 0.9rem)',
              }}
            >
              <RxDesktop style={{ fontSize: 'clamp(1rem, 1vw + 0.5rem, 1.4rem)' }} />
              <span>{returnTitle('menu.home')}</span>
            </NavLink>
          </li>

         {hasCapability(PERMISSIONS.CAN_CREATE_PROJECT) && (
            <li className="nav-item mt-1 mx-3">
              <NavLink to="/create-project" className="sidebar-link d-flex align-items-center gap-2" 
                  style={{
                    color: '#344767',
                    fontSize: 'clamp(0.85rem, 1vw + 0.4rem, 0.9rem)',
                  }}>
                <SiOpenproject style={{ fontSize: 'clamp(1rem, 1vw + 0.5rem, 1.4rem)' }}/>
                <span>{returnTitle('menu.create_project')}</span>
              </NavLink>
            </li>
         )}
        {hasCapability(PERMISSIONS.CAN_CONFIRM_PROJECT_FINANCIER) && (
            <li className="nav-item mt-1 mx-3">
              <NavLink to="/confirm-project-financier" className="sidebar-link d-flex align-items-center gap-2" 
                  style={{
                    color: '#344767',
                    fontSize: 'clamp(0.85rem, 1vw + 0.4rem, 0.9rem)',
                  }}>
                <FaListCheck style={{ fontSize: 'clamp(1rem, 1vw + 0.5rem, 1.4rem)' }}/>
                <span>Confirm Projects (Financier)</span>
              </NavLink>
            </li>
         )}
         {hasCapability(PERMISSIONS.CAN_CHECK_AND_GIP_ATTACH) && (
            <li className="nav-item mt-1 mx-3">
              <NavLink to="/tech-dir-check-and-attach-gip" className="sidebar-link d-flex align-items-center gap-2" 
                  style={{
                    color: '#344767',
                    fontSize: 'clamp(0.85rem, 1vw + 0.4rem, 0.9rem)',
                  }}>
                <IoShieldCheckmarkOutline style={{ fontSize: 'clamp(1rem, 1vw + 0.5rem, 1.4rem)' }}/>
                <span>Verify project (Tech Dir)</span>
              </NavLink>
            </li>
         )}
         {hasCapability(PERMISSIONS.CAN_ADD_DEPARTMENTS) && (
            <li className="nav-item mt-1 mx-3">
              <NavLink to="/add-departments" className="sidebar-link d-flex align-items-center gap-2" 
                  style={{
                    color: '#344767',
                    fontSize: 'clamp(0.85rem, 1vw + 0.4rem, 0.9rem)',
                  }}>
                <PiTreeStructureBold style={{ fontSize: 'clamp(1rem, 1vw + 0.5rem, 1.4rem)' }}/>
                <span>{returnTitle('menu.add_departments')}</span>
              </NavLink>
            </li>
         )}
         {hasCapability(PERMISSIONS.CAN_ADD_PARTNERS) && (
            <li className="nav-item mt-1 mx-3">
              <NavLink to="/add-partners" className="sidebar-link d-flex align-items-center gap-2" 
                  style={{
                    color: '#344767',
                    fontSize: 'clamp(0.85rem, 1vw + 0.4rem, 0.9rem)',
                  }}>
                <SiTheboringcompany style={{ fontSize: 'clamp(1rem, 1vw + 0.5rem, 1.4rem)' }}/>
                <span>{returnTitle('menu.add_partners')}</span>
              </NavLink>
            </li>
         )}
         {hasCapability(PERMISSIONS.CAN_MANAGE_TRANSLATIONS) && (
            <li className="nav-item mt-1 mx-3">
              <NavLink to="/manage-internalization" className="sidebar-link d-flex align-items-center gap-2" 
                  style={{
                    color: '#344767',
                    fontSize: 'clamp(0.85rem, 1vw + 0.4rem, 0.9rem)',
                  }}>
                <LuLanguages style={{ fontSize: 'clamp(1rem, 1vw + 0.5rem, 1.4rem)' }}/>
                <span>{returnTitle('menu.internalization')}</span>
              </NavLink>
            </li>
         )}
      </ul>
    </div>
  );
}
