import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaEnvelope, FaMusic, FaCheckCircle } from "react-icons/fa";

export default function NotificationCard() {
  const [show, setShow] = useState(false);
  const ref = useRef();

  const notifications = [
    {
      icon: <FaEnvelope className="text-primary" />,
      text: "New message from Laur",
      time: "13 minutes ago",
    },
    {
      icon: <FaMusic className="text-success" />,
      text: "New album by Travis Scott",
      time: "1 day",
    },
    {
      icon: <FaCheckCircle className="text-info" />,
      text: "Payment successfully completed",
      time: "2 days",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShow(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="position-relative" ref={ref}>
      <FaBell
        size={18}
        style={{ cursor: "pointer" }}
        onClick={() => setShow(!show)}
      />

      {show && (
        <div className="position-absolute end-0 mt-2 p-3 shadow rounded bg-white"
            style={{ width: "320px", zIndex: 999 }}>
          <h6 className="mb-3 text-dark">Notifications</h6>
          {notifications.map((n, i) => (
            <div key={i} className="d-flex gap-3 align-items-start mb-3">
              <div className="fs-5">{n.icon}</div>
              <div>
                <div className="fw-semibold text-dark">{n.text}</div>
                <small className="text-secondary">{n.time}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
