import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import Alert from './Alert';
import { useNavigate } from 'react-router-dom';

export default function CreateTaskModal({ show, onHide, selectedStaff, onCreated }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (show) {
      setAlertMsg('');
      setLocked(false);
      setTitle('');
    }
  }, [show]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setAlertMsg(returnTitle('task.enter_title'));
      return;
    }

    setSubmitting(true);
    setAlertMsg('');
    try {
      const res = await axiosInstance.post('/user-tasks/create/', {
        title,
        receiver: selectedStaff.user_id,
      });
      setAlertMsg(returnTitle('task.created_successfully'));
      onCreated?.();  // ✅ should call handleTaskCreated
      console.log('🎯 onCreated called');
      setLocked(true);
      setTimeout(() => {
        onHide();
        setTitle('');
        setSubmitting(false);
        setAlertMsg('');
      }, 1200);
    } catch (err) {
      console.error('❌ Failed to create task:', err);
      const d = err?.response?.data;
      const msg = d?.key ? returnTitle(d.key) : Object.values(d || {}).flat().join(', ');
      setAlertMsg('❌ ' + msg);
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="custom-fin-modal">
      <Modal.Body className="p-4 text-light">
        <h5 className="text-info mb-4">{returnTitle('task.create_task')}</h5>

        {alertMsg && <Alert type="info" message={alertMsg} />}

        <div className="mb-3">
          <div className="small mb-1 text-light fw-semibold">{returnTitle('task.receiver')}</div>
          <div className="d-flex align-items-center gap-2 border border-secondary rounded p-1">
            <img
              src={selectedStaff.profile_image}
              alt="avatar"
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
            />
            <span className="fw-semibold text-light">{selectedStaff.fio}</span>
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label className="text-light">{returnTitle('task.task_title')}</Form.Label>
          <Form.Control
            type="text"
            className="bg-transparent border text-light"
            placeholder={returnTitle('task.enter_title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>

        <div className="d-flex justify-content-between">
          <Button variant="outline-light" onClick={onHide} disabled={submitting}>
            {submitting ? returnTitle('app.closing') + '...' : returnTitle('app.cancel')}
          </Button>
          <Button variant="success" onClick={handleSubmit} disabled={submitting || locked}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                {returnTitle('app.creating') + '...'}
              </>
            ) : returnTitle('app.create')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
