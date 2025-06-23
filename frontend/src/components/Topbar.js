import React,{useState,useCallback,useEffect,useMemo} from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaComments } from 'react-icons/fa'; // 👈 Add chat icon
import NotificationCard from './NotificationCard'; // 👈 Qo‘shing
import { useAuth } from '../context/AuthProvider';
import SettingsDropdown from './SettingsDropdown'; // joyini to‘g‘rilang
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import ChatNotificationCard from './ChatNotificationCard'


export default function Topbar({ sidebarVisible, toggleSidebar,searchQuery, setSearchQuery }) {

  const { user,setUser, setAccessToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0); // ✅ new state

  const { returnTitle } = useI18n();
  const navigate = useNavigate();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );
  
  
  const fetchUnreadCount = useCallback(() => {
    axiosInstance.get('/action-logs/unread-count/')
      .then(res => setUnreadCount(res.data.count || 0))
      .catch(() => setUnreadCount(0));
  }, []);


    const fetchUnreadChatCount = useCallback(() => {
    axiosInstance.get('/chat/messages/unread-minimal/')
      .then(res => setUnreadChatCount((res.data || []).length))
      .catch(() => setUnreadChatCount(0));
  }, []);


    useEffect(() => {
    fetchUnreadCount();
    // ✅ also fetch chat count
  }, [fetchUnreadCount]);


    useEffect(() => {
      fetchUnreadChatCount();
      const interval = setInterval(fetchUnreadChatCount, 10000);
      return () => clearInterval(interval);
    }, []);

  return (
    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-0" style={{ color: 'white',minHeight:'5vh' }}>
      
      {/* Left: Toggle + Search */}
      <div className="d-flex align-items-center gap-3">
        {/* Toggle Button */}
        <button
          className="btn btn-info rounded-circle d-flex align-items-center justify-content-center"
          onClick={toggleSidebar}
          style={{ width: 40, height: 40 }}
        >
          {sidebarVisible ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        {/* Search Input */}
        <div className="search-bar-wrapper d-flex align-items-center border bg-white rounded-pill px-3">
            <FaSearch className="me-2 text-muted" />
            <input
                type="text"
                className="form-control border-0 p-0 search-input"
                placeholder={returnTitle('topbar.search_by_project_name')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Optional: You can trigger fetch here or rely on useEffect in Dashboard
                  }
                }}
              />
        </div>

      </div>

      {/* Right: Icons + Profile */}
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex flex-column">
          <strong className="text-white">{user?.fio}</strong>
          <small className="text-muted text-white-50 fs-8" style={{ fontSize: '0.7rem' }}>{user?.position}</small>
        </div>

            {/* ✅ Chat Notification */}
            <div className="position-relative">
              <ChatNotificationCard />
              {unreadChatCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '0.6rem' }}
                >
                  {unreadChatCount}
                </span>
              )}
            </div>

            <div className="position-relative">
            <NotificationCard fetchUnreadCount={fetchUnreadCount}/>
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.6rem' }}
              >
                {unreadCount}
              </span>
            )}
          </div>
        <SettingsDropdown />
      </div>

    </div>
  );
}
