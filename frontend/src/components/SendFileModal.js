import React, { useState, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { useI18n } from '../context/I18nProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import Alert from './Alert';

export default function SendFileModal({ show, onHide, taskId, onUploaded }) {
  const { returnTitle } = useI18n();
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [locked, setLocked] = useState(false);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

    const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 300 * 1024 * 1024;

    const validFiles = selectedFiles.filter(file => file.size <= maxSize);
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
        const names = oversizedFiles.map(f => f.name).join(', ');
        setAlertMsg(`❌ ${returnTitle('task_chat.files_exceed_limit_300_mb')}: ${names}`);
    } else {
        setAlertMsg('');
    }

    if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
    }
    };


  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setAlertMsg(returnTitle('task_chat.select_at_least_one_file'));
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (caption.trim()) formData.append('message', caption.trim());
    formData.append('task_id', taskId);

    setSubmitting(true);
    setAlertMsg('');
    try {
      await axiosInstance.post('/chat/messages/send-files/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAlertMsg('');
      setLocked(true);
      onUploaded?.(); // ✅ same as onCreated
      setTimeout(() => {
        setFiles([]);
        setCaption('');
        setAlertMsg('');
        setSubmitting(false);
        onHide();
      }, 1200);
    } catch (err) {
      setAlertMsg(returnTitle('task_chat.file_sent_fail'));
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md" backdrop="static" className='custom-fin-modal'>
      <Modal.Body className="p-4 text-light">
        <h5 className="text-info mb-3">{returnTitle('chat.send_file')}</h5>

        {alertMsg && <Alert type="info" message={alertMsg} />}

        <Form.Group>
          <Form.Label className="fw-bold text-light">{returnTitle('chat.select_files')}</Form.Label>
          <Form.Control type="file" multiple onChange={handleFileChange} />
        </Form.Group>

        <div className="mt-3">
          {files.map((file, index) => (
            <div key={index} className="d-flex justify-content-between align-items-center bg-dark text-light px-3 py-1 rounded mb-2">
              <span className="text-truncate" style={{ maxWidth: '80%' }}>{file.name}</span>
              <FaTrash className="text-danger" role="button" onClick={() => removeFile(index)} />
            </div>
          ))}
        </div>

        <Form.Group className="mt-3">
          <Form.Label className="text-light">{returnTitle('chat.optional_message')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder={returnTitle('chat.type_message')}
            className="bg-transparent text-white"
          />
        </Form.Group>

        <div className="d-flex justify-content-between mt-4">
          <Button variant="outline-light" onClick={onHide} disabled={submitting}>
            {submitting ? returnTitle('app.closing') + '...' : returnTitle('app.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting || locked || files.length === 0}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                {returnTitle('task_chat.sending')}...
              </>
            ) : returnTitle('task_chat.send')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
