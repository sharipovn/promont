import React, { useState, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Alert from './Alert';
import { useI18n } from '../context/I18nProvider';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';

export default function ConfirmTechPartModal({ show, onHide, part, onConfirmed }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [lock, setLock] = useState(false); // ✅ Lock after success



  const handleConfirm = async () => {
     if (lock) return; // ✅ Prevent duplicate confirmation
    setLoading(true);
    try {
      await axiosInstance.post(`/work-order/tech-parts/${part.tch_part_code}/confirm/`);
      setAlert({
        show: true,
        variant: 'success',
        message: returnTitle('create_wo.confirm_success'),
      });
      setLock(true); // ✅ Lock the confirm button
      setTimeout(() => {
        setAlert({ show: false, variant: '', message: '' });
        onHide();
        onConfirmed();
      }, 800);
    } catch (err) {
      setAlert({
        show: true,
        variant: 'danger',
        message: returnTitle('create_wo.confirm_failed'),
      });
    } finally {
      setLoading(false);
    }
  };


  useMemo(() => {
  if (show) {
    setLock(false); // ✅ Reset when modal opens
    setAlert({ show: false, variant: '', message: '' });
  }
}, [show]);


  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <Modal.Body className="p-4">
        <h5 className="text-success mb-1">
          {returnTitle('create_wo.confirm_tech_part')}
        </h5>

        {alert.show && (
          <Alert
            variant={alert.variant}
            message={alert.message}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        )}

        <Form>
          <Form.Group className="mb-1">
            <Form.Label className="text-light">{returnTitle('create_wo.tech_part_no')}</Form.Label>
            <Form.Control type="text" readOnly value={part?.tch_part_no || ''} className="bg-transparent text-light border-secondary" />
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label className="text-light">{returnTitle('create_wo.tech_part_name')}</Form.Label>
            <Form.Control type="text" readOnly value={part?.tch_part_name || ''} className="bg-transparent text-light border-secondary" />
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label className="text-light">{returnTitle('create_wo.project')}</Form.Label>
            <Form.Control type="text" readOnly value={part?.finance_part?.project?.project_name || ''} className="bg-transparent text-light border-secondary" />
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label className="text-light">{returnTitle('create_wo.fs_part')}</Form.Label>
            <Form.Control type="text" readOnly value={part?.finance_part?.fs_part_name || ''} className="bg-transparent text-light border-secondary" />
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label className="text-light">{returnTitle('create_wo.creator')}</Form.Label>
            <Form.Control type="text" readOnly value={part?.create_user_fio || ''} className="bg-transparent text-light border-secondary" />
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label className="text-light">{returnTitle('create_wo.period')}</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={`${part?.tch_start_date || ''} → ${part?.tch_finish_date || ''}`}
              className="bg-transparent text-light border-secondary"
            />
          </Form.Group>
        </Form>

        <p className="text-light mt-3">
          {returnTitle('create_wo.confirm_question')} <span className="text-info fw-bold">"{part?.tch_part_name}"</span>?
        </p>

        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button variant="outline-secondary" className="rounded-2 px-4" onClick={onHide} disabled={loading}>
            {returnTitle('cancel')}
          </Button>
          <Button
            variant="success"
            className="rounded-2 px-4"
            onClick={handleConfirm}
            disabled={loading || lock}
          >
            {loading ? returnTitle('create_wo.sending') : returnTitle('create_wo.confirm')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
