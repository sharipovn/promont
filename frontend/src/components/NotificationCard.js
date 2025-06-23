import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaBell, FaClock, FaHistory } from 'react-icons/fa';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';
import TinyPagination from './TinyPagination';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useI18n } from '../context/I18nProvider';
import { MdCircleNotifications } from "react-icons/md";

export default function NotificationCard({fetchUnreadCount}) {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('new');
  const [tabFade, setTabFade] = useState(true);
  const ref = useRef();

  const { setUser, setAccessToken } = useAuth();
  const { returnTitle } = useI18n();
  const navigate = useNavigate();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const fetchNotifications = (page = 1) => {
    setLoading(true);
    axiosInstance
      .get('/action-logs/my-notifications/', {
        params: {
          page,
          identified: activeTab === 'history' ? 'true' : 'false',
        },
      })
      .then((res) => {
        setNotifications(res.data.results || []);
        setTotalPages(Math.ceil(res.data.count / 10));
        setError(null);
      })
      .catch((err) => {
        console.error('❌ Failed to load notifications:', err);
        setError('❌ ' + returnTitle('notifications.load_failed'));
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShow(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (show) {
      fetchNotifications(currentPage);
    }
  }, [show, currentPage, activeTab]);

  const handleTabChange = (tabKey) => {
    setTabFade(false);
    setTimeout(() => {
      setActiveTab(tabKey);
      setCurrentPage(1);
      setTabFade(true);
      fetchUnreadCount?.(); // ← added here
    }, 150);
  };

  return (
    <div className="position-relative" ref={ref}>
      <FaBell size={18} style={{ cursor: 'pointer' }} onClick={() => setShow(!show)} />

      {show && (
        <div
          className="position-absolute end-0 mt-2 p-3 shadow rounded"
          style={{
            width: '17vw',
            zIndex: 999,
            background: '#004052',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f1f1f1',
          }}
        >
          {/* Title */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <MdCircleNotifications size={'1.5rem'} />
            <h4 className="mb-0">{returnTitle('notifications.title')}</h4>
          </div>

          {/* Tabs */}
          <div className="d-flex mb-3 border-0 shadow rounded-1 overflow-hidden" style={{ backgroundColor: '#222b3a' }}>
            {['new', 'history'].map((tabKey, idx) => {
              const isActive = activeTab === tabKey;
              const Icon = tabKey === 'new' ? FaClock : FaHistory;

              return (
                <button
                  key={tabKey}
                  onClick={() => handleTabChange(tabKey)}
                  className={`w-50 py-2 fw-semibold border-0 text-capitalize d-flex align-items-center justify-content-center gap-2 ${
                    isActive ? 'bg-success text-white' : 'bg-transparent text-light'
                  }`}
                  style={{
                    fontSize: '1rem',
                    letterSpacing: '0.03em',
                    borderRight: idx === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    transition: 'all 0.3s ease',
                    opacity: isActive ? 1 : 0.85,
                  }}
                >
                  <Icon style={{ transition: 'transform 0.3s ease', transform: isActive ? 'scale(1.15)' : 'scale(1)' }} />
                  {returnTitle(`notifications.${tabKey}`)}
                </button>
              );
            })}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-3 flex-column">
              <div className="spinner-border text-info" style={{ width: '3rem', height: '3rem' }} role="status">
                
              </div>
              <span className="text-light mt-2">{returnTitle('app.loading')}...</span>
            </div>
          ) : (
            <>
              {/* Error */}
              {error && <div className="text-danger">{error}</div>}

              {/* Empty State */}
              {!error && notifications.length === 0 && (
                <div
                  className="d-flex align-items-center gap-2 small rounded-4 px-3 py-2 text-muted"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    fontStyle: 'italic',
                  }}
                >
                  <FaClock className="fs-5 text-warning" />
                  <span>{returnTitle('notifications.no_new')}</span>
                </div>
              )}

              {/* Notification list */}
              <div
                style={{
                  maxHeight: '50vh',
                  overflowY: 'auto',
                  opacity: tabFade ? 1 : 0,
                  transform: tabFade ? 'translateY(0)' : 'translateY(5px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}
                className="notification-card-scrollbar pe-1"
              >
                {notifications.map((n) => (
                  <Notification
                    key={n.full_id + n.performed_at}
                    log={n}
                    hideAction={activeTab === 'history'}
                    onIdentified={() => {
                      fetchNotifications(currentPage);
                      fetchUnreadCount?.(); // ← trigger unread update too
                    }}

                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <TinyPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
