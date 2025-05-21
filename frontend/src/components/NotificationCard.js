import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert'; // adjust path if needed
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { FaProjectDiagram } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { FaHourglassHalf } from 'react-icons/fa';




export default function NotificationCard() {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const ref = useRef();

  const { setUser, setAccessToken,hasCapability  } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(() => {
    return createAxiosInstance(navigate, setUser, setAccessToken);
  }, [navigate, setUser, setAccessToken]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShow(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (show && hasCapability('CAN_CONFIRM_PROJECT_FINANCIER')) {
      axiosInstance
        .get("/projects-notifications/financier/")
        .then((res) => {
          setNotifications(res.data);
          setError(null);
        })
        .catch((err) => {
          console.error("❌ Failed to load notifications:", err);
          setError("❌ Failed to load notifications."+err);
          setNotifications([]);
        });
    }
  }, [show, axiosInstance]);

  return (
    <div className="position-relative" ref={ref}>
      <FaBell
        size={18}
        style={{ cursor: "pointer" }}
        onClick={() => setShow(!show)}
      />

{show && (
  <div
    className="position-absolute end-0 mt-2 p-3 shadow rounded"
    style={{
      width: "400px",
      zIndex: 999,
      background: "rgba(255, 255, 255, 0.04)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "#f1f1f1"
    }}
  >
    <h6 className="mb-3">Notifications</h6>

    {error && <Alert type="danger" message={error} />}

    {!error && notifications.length === 0 && (
        <div
          className="d-flex align-items-center gap-3 small rounded-4 px-3 py-2"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))',
            border: '1px dashed rgba(255,255,255,0.12)',
            color: '#dee2e6',
            fontStyle: 'italic',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
          }}
        >
          <FaCheckCircle className="fs-5 text-warning" />
          <span className="text-light">
            Sizda hozircha <strong>yangi bildirishnoma yo‘q</strong>
          </span>
        </div>
      )}


<div style={{ maxHeight: '300px', overflowY: 'auto' }} className="notification-card-scrollbar pe-1">
{notifications.map((n, i) => {
  // console.log('notifications:',notifications)
  const createdAt = new Date(n.create_date);
  const daysOld = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
  return (
    <div
      key={i}
      className="mb-2 p-3 rounded"
      style={{
        background: "linear-gradient(145deg, #1e2430, #151a26)",
        border: "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#222b3a";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "linear-gradient(145deg, #1e2430, #151a26)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="d-flex align-items-center gap-2 mb-1">
        <FaProjectDiagram className="text-info" />
        <div className="fw-semibold text-info">{n.project_name}</div>
        <span className="badge bg-success-subtle text-success ms-auto">New Project</span>
      </div>
      <div className="text-secondary mb-2" style={{ fontSize: '0.85rem', fontWeight: 'normal',fontFamily:'Exo2Variable' }}>
        {n.start_date} → {n.end_date}
      </div>
      <div
        title={`Created by: ${n.create_user_fio}`}
        className="small mb-1"
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 500,
          color: '#adb5bd'  // 🔹 soft muted gray-blue
        }}
      >
        <span style={{ color: '#f8f9fa' }}>Created by:</span>{' '}
        <span style={{ color: '#ffffff' }}>{n.create_user_fio}</span>
      </div>

      <div className="d-flex align-items-center justify-content-between">
      <span className="text-warning small d-flex align-items-center gap-1">
          <FaHourglassHalf className="text-warning" />
          Tasdiqlanmagan (siz tomonidan)
        </span>

        <span
          className="badge rounded-pill bg-light text-dark-emphasis"
          style={{ fontSize: '0.75rem' }}
        >
          {daysOld} days ago
        </span>
      </div>
    </div>
  );
})}
</div>

  </div>
)}

    </div>
  );
}
