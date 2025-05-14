import React, { useState, useRef, useEffect } from 'react';
import { IoMdSettings } from 'react-icons/io';
import { FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthProvider'; // path adjust qiling
import { useNavigate } from 'react-router-dom';

export default function SettingsDropdown() {
  const [show, setShow] = useState(false);
  const ref = useRef();
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="position-relative" ref={ref}>
      <IoMdSettings
        size={20}
        onClick={() => setShow(!show)}
        style={{ cursor: 'pointer', color: '#f1f1f1' }}
      />
      {show && (
        <div
          className="position-absolute end-0 mt-2 p-3 rounded shadow"
          style={{
            width: '250px',
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            zIndex: 999,
          }}
        >
          <h6 className="text-white mb-2 fw-semibold">Settings</h6>
          <div
            className="d-flex align-items-center gap-2 p-2 rounded hover-effect"
            style={{
              cursor: 'pointer',
              backgroundColor: 'rgba(255,255,255,0.05)',
              transition: 'background-color 0.3s ease'
            }}
            onClick={handleLogout}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
          >
            <FaSignOutAlt className="text-danger" />
            <span className="text-light">Logout</span>
          </div>
        </div>
      )}
    </div>
  );
}
