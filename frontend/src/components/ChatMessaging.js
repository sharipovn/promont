import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { FaComments, FaPaperPlane } from 'react-icons/fa';
import { useI18n } from '../context/I18nProvider';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import {formatDateTime} from '../utils/formatDateTime'
import { FaCheckCircle } from "react-icons/fa";
import { VscError } from "react-icons/vsc";
import Alert from './Alert';




export default function ChatMessaging({ show, onHide, item}) {
  const inputRef = useRef(null);
  console.log('cliked item:',item)
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken, user } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!item?.full_id || !item?.path_type) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get('/messages/', {
        params: {
          full_id: item.full_id,
          path_type: item.path_type,
        },
      });
      setMessages(res.data);

      setError('');
    } catch (err) {
      setError(returnTitle('tree_chat.load_messages_failed'));
    } finally {
      setLoading(false);
    }
  }, [axiosInstance, item]);

  useEffect(() => {
    if (show) fetchMessages();
  }, [show, fetchMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
      const trimmed = messageText.trim();
      if (!trimmed) {
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await axiosInstance.post('/messages/send/', {
          content: trimmed,
          full_id: item.full_id,
          path_type: item.path_type,
        });

        const newMessage = {
          ...res.data,
          content: trimmed,
          sender_fio: user.fio,
          sender_position: user.position,
          create_time: new Date().toISOString(),
          message_id: Date.now(),
        };

        setMessages(prev => {
            const updated = [...prev, newMessage];
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 1);
            return updated;
          });
        setMessageText('');
        inputRef.current?.focus(); // 👈 keeps caret inside
        setError('');
      } catch (err) {
        setError(returnTitle('tree_chat.send_message_failed'));
      } finally {
        setIsSubmitting(false);
      }
    };


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {error && (
          <Alert
            type="info"
            message={
              <span className="d-flex align-items-center gap-2">
                <VscError /> {error}
              </span>
            }
          />
        )}

      <Modal show={show} onHide={onHide} backdrop="static" size="md" centered>
        <Modal.Header style={{ backgroundColor: '#1e1e2f', borderBottom: '1px solid #444' }} closeButton>
            <Modal.Title className="text-light">
              <FaComments className="me-2" />
              {returnTitle('app.chat')} <br />
              <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                {item?.path_type ? returnTitle(`obj.${item.path_type.toLowerCase()}`) : '—'}-{item?.wo_name || item?.project_name || item?.tch_part_name || item?.fs_part_name || '—'}
              </small>
            </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className="tiny-scrollbar"
          style={{
            backgroundColor: '#1e1e2f',
            color: '#fff',
            minHeight: '50vh',
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="info" />
              <div className="mt-2 text-light small">
                {`${returnTitle('tree_chat.loading_messages')}...`}
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {messages.length === 0 && <div className="small text-light"> {returnTitle('tree_chat.no_messages')}</div>}
              {messages.map((msg) => {
                const isMine = user?.fio === msg.sender_fio;
                return (
                  <div
                    key={msg.message_id}
                    className={`p-2 px-3 rounded ${isMine ? 'align-self-end bg-primary text-white' : 'align-self-start bg-light text-dark'}`}
                    style={{
                      maxWidth: '75%',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <div className="text-start small" style={{ fontSize: '0.6rem', opacity: 0.7 }}>
                      {msg.sender_fio}{' '}({msg.sender_position})
                    </div>
                    <div className="small">{msg.content}</div>
                    <div className="text-end small" style={{ fontSize: '0.6rem', opacity: 0.7 }}>
                      {formatDateTime(msg.create_time)}{'  '}<FaCheckCircle/><br/> 
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef}></div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: '#1e1e2f', borderTop: '1px solid #444',cursor:'pointer' }}>
          <Form.Group className="d-flex gap-2 w-100 mb-0 flex-row justify-content-center align-items-center">
            <Form.Control
              ref={inputRef}
              as="textarea"
              rows={1}
              placeholder={`${returnTitle('tree_chat.write_message_placeholder')}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              style={{
                resize: 'none',
                backgroundColor: '#2b2b3d',
                color: '#fff',
                borderColor: '#444',
                borderRadius: '12px',
              }}
            />
            <Button
                variant="info"
                disabled={!messageText.trim() || isSubmitting}
                onClick={handleSend}
                onMouseDown={(e) => {
                  if (e.detail === 1) e.preventDefault(); // prevent focus, not click
                }}
                className="d-flex align-items-center justify-content-center p-2"
                style={{
                  borderRadius: '50%',
                  cursor: !messageText.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                  outline: 'none',
                  boxShadow: 'none',
                }}
              >
                <FaPaperPlane size="1rem" />
              </Button>

          </Form.Group>
        </Modal.Footer>
      </Modal>
    </>
  );
}
