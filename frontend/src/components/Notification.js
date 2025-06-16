import React, { useState, useMemo } from 'react';
import { FaProjectDiagram, FaEllipsisH } from 'react-icons/fa';
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { useI18n } from '../context/I18nProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';

export default function Notification({ log , hideAction = false, onIdentified}) {
  const { returnTitle } = useI18n();
  const [showComment, setShowComment] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [identified, setIdentified] = useState(log.identified); // Local update
  const [isFadingOut, setIsFadingOut] = useState(false);



  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const toggleComment = () => setShowComment(prev => !prev);

    const handleIdentify = () => {
        if (identifying || identified) return;
        setIdentifying(true);
        setIsFadingOut(true); // 🔄 Start fade-out effect

        setTimeout(() => {
          axiosInstance.post(`/action-logs/${log.action_id}/mark-identified/`)
            .then(() => {
              setIdentified(true);
              if (typeof onIdentified === 'function') {
                onIdentified(); // ⏳ Refetch after animation
              }
            })
            .catch((err) => {
              console.error('❌ Failed to mark as identified:', err);
              setIsFadingOut(false); // Cancel fade if failed
            })
            .finally(() => {
              setIdentifying(false);
            });
        }, 300); // ⏱ Delay to allow fade animation
      };

  const createdAt = new Date(log.performed_at);
  const daysAgo = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));

  function formatDaysAgo(daysAgo) {
    if (daysAgo === 0) return returnTitle('notification.today');
    if (daysAgo === 1) return returnTitle('notification.yesterday');
    return returnTitle('notification.days_ago').replace('{count}', daysAgo);
  }

  return (


    <div
      className={`mb-2 p-3 rounded notification-card position-relative ${isFadingOut ? 'fade-out' : ''}`}
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
          {isFadingOut && (
          <div
            className="fade-check-overlay d-flex justify-content-center align-items-center"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(34, 43, 58, 0.95)',
              zIndex: 10,
              animation: 'pop-check 0.5s ease-out',
              }}
            >
              <IoCheckmarkCircleOutline size="4rem" color="limegreen" /> {returnTitle('notification.identified')}
            </div>
          )}



      <div className="d-flex align-items-center gap-2 mb-1">
        <FaProjectDiagram className="text-warning" />
        <div className="fw-semibold text-info">
          {log?.object_data?.name}
          <span className='text-white'> | </span>
          <span className='text-success'>{returnTitle(`obj.${log.path_type.toLowerCase()}`).toUpperCase()}</span>
        </div>
        <span className="badge rounded-pill bg-light text-dark-emphasis ms-auto">
          {formatDaysAgo(daysAgo)}
        </span>
      </div>

      <div className="text-secondary mb-2 small">
        {returnTitle(`action_log.${log.phase_type.key.toLowerCase()}`).toUpperCase()}
        {log.comment && (
          <FaEllipsisH
            role="button"
            className="ms-2 text-light"
            style={{ cursor: 'pointer' }}
            onClick={toggleComment}
          />
        )}
      </div>

      {showComment && (
        <div className="text-secondary mb-2 small ps-3 border-start border-secondary">
          {log.comment}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center">
        <span className="text-light small">{returnTitle('notification.by')}: {log.performed_by_fio}</span>

          {!hideAction && (
          <button
            type="button"
            disabled={identified || identifying}
            onClick={handleIdentify}
            className={`badge rounded px-3 py-2 shadow-sm btn-sm text-uppercase border-0 ${
              log.phase_type.is_refusal ? 'bg-danger' : 'bg-primary'
            }`}
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
              cursor: identified ? 'not-allowed' : 'pointer',
              opacity: identified ? 0.6 : 1,
            }}
          >
            <IoCheckmarkCircleOutline size={'1rem'} />{' '}
            {returnTitle('notification.mark_as_identified')}
          </button>
        )}

      </div>
    </div>
  );
}
