import React from 'react';
import './ChatPanel.css';
import { FaArrowAltCircleDown } from "react-icons/fa";
import { formatDateTime } from '../utils/formatDateTime';
import HoverTooltip from './HoverTooltip';
import { useI18n } from '../context/I18nProvider';
import { safeDownload } from '../utils/safeDownload';




export default function ChatMessageItem({ msg }) {
  const senderFio = msg.is_me ? 'Me' : msg.sender?.fio;
  // Inside component:
  const { returnTitle } = useI18n();

  return (
    <div className={`chat-msg ${msg.is_me ? 'my-msg' : 'their-msg'}`} style={{ maxWidth: '60%' }}>
      
      {/* 👤 Sender */}
      <div className={`fw-semibold mb-1 ${msg.is_me ? 'text-success' : 'text-white'}`}>
        {senderFio}
      </div>

      {/* 📎 Files */}
      {msg.files?.map(file => (
        <div key={file.file_url} className="chat-file text-white">
          <div className="file-icon">
            <FaArrowAltCircleDown size="2.5rem" />
          </div>
          <div className="file-name-wrapper">
            <a
              href={file.file_url}
              download
              onClick={(e) => safeDownload(e, file.file_url, returnTitle)}
              className="text-white text-decoration-none file-name-ellipsis"
            >
              <HoverTooltip maxWidth='100%'>{file.file_original_name}</HoverTooltip>
            </a>
            <div className="sm text-white">{file.file_size}</div>
          </div>
        </div>
      ))}

      {/* ✉️ Text */}
      {msg.message && (
        <div className="mt-1">{msg.message}</div>
      )}

      {/* 🕓 Timestamp + Seen */}
      {/* 🕓 Timestamp + Seen */}
      <div className="mt-3 text-end small text-secondary" style={{ cursor: 'pointer' }}>
        {formatDateTime(msg?.send_time)}
        {msg.is_me && msg.is_read && (
          <>
            {' · '}
            <span
              className="text-info"
              title={`${returnTitle('chat.seen_at')}: ${formatDateTime(msg.read_time)}`}
              style={{ fontSize: '0.875rem' }}
            >
              {returnTitle('chat.seen')}
            </span>
          </>
        )}
      </div>

    </div>
  );
}
