import React, { useState,useEffect, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import Alert from './Alert';

export default function UnlockFinishedWorkOrderModal({ show, onHide, order, onConfirmed }) {

  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });

  // Show alert when modal is opened
  useEffect(() => {
    if (show) {
      setAlert({ show: false, variant: '', message: '' })
      setLocked(false)
    }
  }, [show]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`/work-order/${order.wo_id}/unlock-finished-work-order/`);
      setLocked(true);
      setAlert({ show: true, variant: 'success', message: returnTitle('finish_wo.unlock_finished_work_order_success') });
      setTimeout(() => {
        onHide();
        onConfirmed();
      }, 1000);
    } catch {
      setAlert({ show: true, variant: 'danger', message: returnTitle('finish_wo.unlock_work_order_failed') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <Modal.Body className="p-4">
        <h5 className="text-success mb-3">{returnTitle('finish_wo.unlock_finished_work_order')}</h5>
        {alert.show && (
          <Alert variant={alert.variant} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />
        )}
        <p className="text-light">
          {returnTitle('finish_wo.unlock_question')} <span className="text-info fw-bold">"{order?.wo_name}"</span>?
        </p>
        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
            {returnTitle('app.cancel')}
          </Button>
          <Button variant="success" onClick={handleConfirm} disabled={loading || locked}>
            {loading ? returnTitle('finish_wo.sending') : returnTitle('finish_wo.unlock_work_order_to_fix')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
