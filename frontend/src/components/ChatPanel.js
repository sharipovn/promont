import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useI18n } from '../context/I18nProvider';
import { CiSearch } from 'react-icons/ci';
import './ChatPanel.css';
import ChatMessageItem from './ChatMessageItem';
import { IoIosArrowDropdown } from "react-icons/io";
import { FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import SendFileModal from './SendFileModal'; // Adjust the path if needed



export default function ChatPanel({ selectedTask }) {


  const { user,setUser, setAccessToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);


  const navigate = useNavigate();
  const { returnTitle } = useI18n();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);
  const scrollRef = useRef();
  const chatBodyRef = useRef();
  const didMountRef = useRef(false);

  const taskId = selectedTask?.task_id;
  const targetUser = selectedTask?.receiver;


    const fetchMessages = useCallback(async (silent = false) => {
      if (!taskId) return;
      if (!silent) setLoading(true);
      try {
        const res = await axiosInstance.get(`/chat/messages/task/${taskId}/`);
        setMessages(res.data);
        setAlertMsg('');
        if (!silent) {
          didMountRef.current = false; // will trigger scroll
        }
      } catch (err) {
        setAlertMsg(returnTitle('task_chat.messages_couldnt_be_loaded'));
      } finally {
        if (!silent) setLoading(false);
      }
    }, [taskId, axiosInstance]);


    useEffect(() => {
      if (taskId) {
        didMountRef.current = false;
        fetchMessages(); // normal, will scroll
      }
    }, [taskId, fetchMessages]);



    useEffect(() => {
      if (taskId && messages.length > 0) {
        axiosInstance.post(`/chat/messages/task/${taskId}/mark-read/`)
          .then(() => {
            setAlertMsg('');
          })
          .catch(() => {
            setAlertMsg(`❌ ${returnTitle('task_chat.couldnt_be_mark_as_read')}`);
          });
      }
    }, [taskId, axiosInstance, messages]);


  useEffect(() => {
    if (!didMountRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: 'auto' });
      didMountRef.current = true;
    } else {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchQuery]);

  useEffect(() => {
    const el = chatBodyRef.current;
    if (!el) return;
    const handleScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
      setShowScrollToBottom(messages.length > 10 && !atBottom);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [messages]);

    const handleSend = async () => {
      if (!input.trim()) return;
      try {
        await axiosInstance.post(`/chat/messages/send/`, {
          task_id: taskId,
          message: input.trim(),
        });
        setInput('');
        setAlertMsg('');
        await fetchMessages(true); // 🔕 silent mode, no scroll
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); // manual scroll
      } catch (err) {
        console.error('❌ Send error:', err);
        setAlertMsg(`❌ ${returnTitle('task_chat.msg_not_sent_error')}`);
      }
    };



  const filteredMessages = messages.filter(msg =>
    (msg.message && msg.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (msg.files && msg.files.some(file =>
      file.file_original_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

    useEffect(() => {
    if (!taskId) return; // ✅ safe, inside hook

    const interval = setInterval(() => {
      fetchMessages(true);
    }, 5000);//10000

    return () => clearInterval(interval);
  }, [taskId, fetchMessages]);

  if (!selectedTask) {
    return <div className="chat-panel d-flex justify-content-center align-items-center"> {returnTitle('chat.select_staff')}</div>;
  }

  return (
    <div className="chat-panel d-flex flex-column position-relative">
      {/* 🔷 Header */}
      <div className="chat-header d-flex justify-content-between align-items-center p-2">
        <div className="d-flex flex-column">
          <div className="text-success">
            {returnTitle('task.task_no')}-{selectedTask.task_id}
          </div>
          <div className="text-info">
            {returnTitle('chat.with')}: <strong>{targetUser?.fio}</strong>
          </div>
        </div>

        <div className="d-flex align-items-center border border-secondary rounded-3 px-3 mb-2 mx-2 mt-2" style={{ backgroundColor: '#242f3d' }}>
          <CiSearch className="me-2 text-light" />
          <input
            style={{ backgroundColor: '#242f3d' }}
            type="text"
            className="form-control border-0 text-white p-1 search-input"
            placeholder={`${returnTitle('task.search_message')} . . .`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 🔽 Messages */}
      <div
        ref={chatBodyRef}
        className="chat-body custom-scroll flex-grow-1 px-3 py-2"
        style={{ height: '70vh', overflowY: 'auto' }}
      >
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
            <div
              className="spinner-border text-info"
              role="status"
              style={{ width: '5rem', height: '5rem', borderWidth: '0.2em', opacity: 0.75 }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {filteredMessages.map(msg => (
              <ChatMessageItem key={msg.message_id} msg={msg} />
            ))}
            <div ref={scrollRef} />
          </>
        )}
      </div>

      {/* ⬇ Scroll to bottom */}
      {(showScrollToBottom || messages.length > 5) && (
        <div
          className="text-light"
          style={{ position: 'absolute', bottom: '120px', right: '40px', zIndex: 10 }}
          onClick={() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          <IoIosArrowDropdown size={'2.5rem'} />
        </div>
      )}


        {!selectedTask?.done && (
            <>
              {/* 📝 Input + File Send */}
              <div className="chat-input p-2 border-top d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary me-2 d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                  title={returnTitle('chat.attach_file')}
                  onClick={() => setShowFileModal(true)}
                >
                  <FaPaperclip />
                </button>

               <input
                  className="form-control me-2 msg-input text-white rounded"
                  placeholder={returnTitle('chat.type_message')}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />


                <button
                  className="btn btn-primary d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                  onClick={handleSend}
                  title={returnTitle('chat.send')}
                >
                  <FaPaperPlane />
                </button>
              </div>

              {showFileModal && (
                <SendFileModal
                show={showFileModal}
                onHide={() => setShowFileModal(false)}
                taskId={selectedTask?.task_id}
                onUploaded={async () => {
                  await fetchMessages(true); // silent reload without loading spinner or jump
                  scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); // optional smooth scroll
                }}
              />
              )}
            </>
          )}
    </div>
  );
}
