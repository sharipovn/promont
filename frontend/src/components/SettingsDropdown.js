import React, { useState, useRef, useEffect } from 'react';
import { IoMdSettings } from 'react-icons/io';
import { FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../context/I18nProvider';
import ChangePasswordModal from './ChangePasswordModal'; // top of file
import { FaLock } from "react-icons/fa6";

export default function SettingsDropdown() {
  const [show, setShow] = useState(false);
  const ref = useRef();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { lang, changeLanguage, returnTitle } = useI18n(); // ✅ include returnTitle
  // inside component
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const langOptions = [
    { code: 'en', label: 'Eng' },
    { code: 'ru', label: 'Рус' },
    { code: 'uz', label: "O'zb" },
    { code: 'i18n', label: 'i18n' } // ✅ added
  ];

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
            width: '310px',
            background: '#24324a',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            userSelect: 'none',
            zIndex: 999,
          }}
        >
          <h6 className="text-white mb-3 fw-semibold">{returnTitle('settings')}</h6>

          <div className="d-flex justify-content-between gap-2 mb-3">
            {langOptions.map((item) => (
              <div
                key={item.code}
                onClick={() => changeLanguage(item.code)}
                className={`flex-fill text-center py-2 rounded text-white fw-semibold ${
                  lang === item.code ? 'bg-primary' : 'bg-transparent'
                }`}
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </div>
            ))}
          </div>

          <div
              className="d-flex align-items-center gap-2 p-2 rounded hover-effect mb-2"
              style={{
                cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.05)',
                transition: 'background-color 0.3s ease',
                userSelect: 'none',
              }}
              onClick={() => {
                setShow(false); // ✅ close dropdown
                setShowPasswordModal(true); // ✅ open modal
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')
              }
            >
              <FaLock className="text-info" />
              <span className="text-light">{returnTitle('change_pass.change_password')}</span>
            </div>



          <div
            className="d-flex align-items-center gap-2 p-2 rounded hover-effect"
            style={{
              cursor: 'pointer',
              backgroundColor: 'rgba(255,255,255,0.05)',
              transition: 'background-color 0.3s ease',
              userSelect: 'none',
            }}
            onClick={handleLogout}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')
            }
          >
            <FaSignOutAlt className="text-danger" />
            <span className="text-light">{returnTitle('logout')}</span>
          </div>
        </div>
      )}
        <ChangePasswordModal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} />
    </div>
  );
}
