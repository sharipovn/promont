import React, { useState, useMemo,useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Alert from './Alert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useI18n } from '../context/I18nProvider';

export default function WorkOrderConfirmModal({ show, onHide, order, onConfirmed }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [locked, setLocked] = useState(false);


  useEffect(() => {
    if (show) {
      setLocked(false);
    }
  }, [show]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`/complete-work-order/${order.wo_id}/confirm/`);
      setLocked(true); // ✅ Lock UI after success
      setAlert({
        show: true,
        variant: 'success',
        message: returnTitle('complete_wo.confirm_success'),
      });
      setTimeout(() => {
        setAlert({ show: false, variant: '', message: '' });
        onHide();
        onConfirmed();
      }, 800);
    } catch (err) {
      setAlert({
        show: true,
        variant: 'danger',
        message: returnTitle('complete_wo.confirm_failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <Modal.Body className="p-4">
        <h5 className="text-success mb-3">{returnTitle('complete_wo.confirm_work_order')}</h5>

        {alert.show && (
          <Alert
            variant={alert.variant}
            message={alert.message}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        )}

        <Form>
          <Form.Group className="mb-2">
            <Form.Label className="text-light">{returnTitle('create_wo.wo_name')}</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={order?.wo_name || ''}
              className="bg-transparent text-light border-secondary"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="text-light">{returnTitle('create_wo.project')}</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={order?.tech_part?.finance_part?.project?.project_name || ''}
              className="bg-transparent text-light border-secondary"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="text-light">{returnTitle('create_wo.period')}</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={`${order?.wo_start_date || ''} → ${order?.wo_finish_date || ''}`}
              className="bg-transparent text-light border-secondary"
            />
          </Form.Group>
        </Form>

        <p className="text-light mt-3">
          {returnTitle('complete_wo.confirm_question')} <span className="text-info fw-bold">"{order?.wo_name}"</span>?
        </p>

        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button variant="outline-secondary" onClick={onHide} disabled={loading} className="rounded-2 px-4">
            {returnTitle('cancel')}
          </Button>
          <Button variant="success" onClick={handleConfirm} disabled={loading || locked} className="rounded-2 px-4">
            {loading ? returnTitle('create_wo.sending') : returnTitle('complete_wo.confirm')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
