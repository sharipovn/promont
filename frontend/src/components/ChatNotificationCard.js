import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaComments, FaRegFileAlt } from 'react-icons/fa';
import { SiImessage } from "react-icons/si";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useI18n } from '../context/I18nProvider';
import { formatDateTime } from '../utils/formatDateTime';
import './ChatNotificationCard.css';
import { FaProjectDiagram, FaEllipsisH } from 'react-icons/fa';




export default function ChatNotificationCard() {
  const [visible, setVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const toggleComment = (messageId) => {
    setActiveMessageId(prev => prev === messageId ? null : messageId);
    };
  const ref = useRef();

  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();
  const { returnTitle } = useI18n();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const fetchChatMessages = async () => {
    try {
      const res = await axiosInstance.get('/chat/messages/unread-minimal/');
      const data = res.data || [];
      setChatMessages(data);
      setUnreadCount(data.length);
    } catch {
      setChatMessages([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setVisible(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="position-relative" ref={ref}>
      <SiImessage
        size={18}
        style={{ cursor: 'pointer' }}
        onClick={() => setVisible(!visible)}
      />

      {unreadCount > 0 && (
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
          {unreadCount}
        </span>
      )}

      {visible && (
        <div
          className="chat-dropdown-card shadow  text-white rounded p-3 rounded-3 position-absolute end-0 mt-2 chat-scroll-container"
          style={{
            width: 380,
            maxWidth: '30vw',
            maxHeight: '60vh',
            zIndex: 999,
            overflowY: 'auto',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor:'#004052'
          }}
        >
          <h6 className="text-white mb-3 d-flex align-items-center gap-2">
            <FaComments /> {returnTitle('task_chat.unread_messages')}
          </h6>

          {chatMessages.length === 0 ? (
            <div
              className="d-flex align-items-center gap-2 small rounded-4 px-3 py-2 text-muted"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed rgba(255,255,255,0.2)',
                fontStyle: 'italic',
              }}
            >
              <FaComments className="fs-5 text-warning" />
              <span>{returnTitle('chat.no_unread')}</span>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.message_id}
                className="px-3 py-1 mb-1"
                style={{
                  backgroundColor: '#1f2e3a',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                {/* Sender and Task ID */}
                <div className="d-flex justify-content-between align-items-center fw-semibold mb-2 fs-6 text-nowrap">
                  <span className="text-success text-truncate me-2" style={{ maxWidth: '50%' }}>{msg.sender_fio}</span>
                  <span className="text-uppercase text-info text-truncate text-end" style={{ maxWidth: '45%' }}>
                    ({returnTitle('task.task')}-{msg.task_id})
                  </span>
                </div>

                {/* File info */}
                {msg.files?.length > 0 && (
                  <div className="text-info mb-2 d-flex align-items-center gap-2 small">
                    <FaRegFileAlt className="text-info" />
                    <span>{msg.files.length} {returnTitle('chat.files')}</span>
                  </div>
                )}

                {/* Message */}
                {/* Message icon toggle */}
                {/* Message text area - toggles on click */}
                {msg.message && (
                <div
                    className={`text-secondary mb-2 small ps-3 border-start border-secondary ${
                    activeMessageId !== msg.message_id ? 'clamped-text' : ''
                    }`}
                    onClick={() =>
                    setActiveMessageId((prev) => (prev === msg.message_id ? null : msg.message_id))
                    }
                    style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                    }}
                     >
                    {msg.message}
                </div>
                )}





                {/* Time */}
                <div className="text-light small text-end" style={{ fontSize: '0.75rem' }}>
                  {formatDateTime(msg.send_time)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
