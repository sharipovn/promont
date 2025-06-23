import React, { useMemo, useState } from 'react';
import './TaskListComponent.css';
import { useI18n } from '../context/I18nProvider';
import { FaRegClock, FaCheckCircle } from 'react-icons/fa';
import { SiTask } from "react-icons/si";
import HoverTooltip from './HoverTooltip';
import Alert from './Alert'; // ✅ Use your custom Alert
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { formatDateTime } from '../utils/formatDateTime';
import { useNavigate } from 'react-router-dom';
import { FaCircleCheck } from "react-icons/fa6";
import { MdOutlineCheckCircle } from "react-icons/md";

export default function TaskItem({ task, onUpdated, onClick }) {
  console.log('task:',task)
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);


    const [errorMsg, setErrorMsg] = useState('');
    const [fade, setFade] = useState(false);
    const [showSuccessCheck, setShowSuccessCheck] = useState(false);

  const cardClass = `${task.receiver_is_me ? 'task-card to-me' : 'task-card from-me'} ${task.done ? 'done' : ''} ${fade ? 'fade-out' : ''}`;

    const handleMarkAsDone = async () => {
    try {
        await axiosInstance.post(`/user-tasks/mark-done/${task.task_id}/`);
        setShowSuccessCheck(true);  // ✅ Show animation
        setErrorMsg('')
        setTimeout(() => setShowSuccessCheck(false), 1000); // hide check
        setTimeout(() => {
        setFade(true);
        }, 600); // smooth transition

        setTimeout(() => {
        setFade(false);
        onUpdated?.();
        }, 1000);
    } catch (err) {
        console.error('❌ Mark as done failed:', err);
        setErrorMsg('❌ ' + returnTitle('task.marked_done_fail'));
        setTimeout(() => setErrorMsg(''), 3000);
    }
    };

  return (
    <div className={`${cardClass} shadow position-relative`} onClick={onClick}>
      {errorMsg && <Alert type="danger" message={errorMsg} />}
      {showSuccessCheck && (
    <div className="animated-check">
        <MdOutlineCheckCircle size={'5rem'} className="text-success big-check" />
    </div>
    )}
      {/* Task Header */}
      <div className="task-header d-flex justify-content-between align-items-center mb-1">
        <span className="text-success text-uppercase fw-semibold d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
          <SiTask className={`me-1 ${task.receiver_is_me ? 'text-danger' : 'text-info'}`} />
          {returnTitle('task.task_no')}-{task.task_id}

          {/* 🔵 Total messages badge */}
          <span className="badge bg-secondary ms-2">
            {task.message_count}
          </span>

          {/* 🔴 Unread messages badge (only if > 0) */}
          {task.unread_count > 0 && (
            <span className="badge bg-danger ms-2">
              {task.unread_count}
            </span>
          )}
        </span>


        {task.done && (
          <span className="text-success small d-flex align-items-center">
            <FaCheckCircle className="me-1" />
            {returnTitle('task.completed')}
          </span>
        )}
      </div>

      {/* Task Title */}
      <div className="border-start border-3 border-info ps-3 fw-bold mb-1 rounded text-truncate" style={{ maxWidth: '100%' }}>
        <HoverTooltip maxWidth="100%">{task.title}</HoverTooltip>
      </div>

      {/* Sender/Receiver Info */}
      <div className="task-meta small mb-1">
        {task.receiver_is_me
          ? `${returnTitle('task.due_from')} ${task?.sender?.fio} (${task?.sender?.position_name})`
          : `${returnTitle('task.due_to')} ${task?.receiver?.fio} (${task?.receiver?.position_name})`}
      </div>

      {/* Footer */}
      <div className="d-flex justify-content-between align-items-center small text-secondary mb-2">
        <div className="d-flex align-items-center">
          <FaRegClock className="me-1" />
          {returnTitle('task.created_at')}: {formatDateTime(task.create_time)}
        </div>

        {!task.receiver_is_me && !task.done && (
          <button className="btn-sm btn btn-primary d-flex align-items-center gap-2" onClick={handleMarkAsDone}>
            <FaCircleCheck />
            {returnTitle('task.mark_done')}
          </button>
        )}
      </div>

      {/* Done Time */}
      {task.done && task.done_time && (
        <div className="d-flex align-items-center small text-secondary mb-2">
          <FaCheckCircle className="me-1" />
          {returnTitle('task.done_at')}: {formatDateTime(task.done_time)}
        </div>
      )}
    </div>
  );
}
