import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Alert from './Alert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useI18n } from '../context/I18nProvider';

export default function RefuseFinishedWorkOrderModal({ show, onHide, order, onRefuse }) {

  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (show) {
      setLocked(false);
    }
  }, [show]);


  useEffect(() => {
    if (order?.last_status?.latest_action === 'WORK_ORDER_REFUSED_BY_NACH_OTDEL') {
      axiosInstance
        .get(`/work-order/${order.wo_id}/refuse-finished-work-order/`) // Assuming GET returns last refusal info
        .then((res) => {
          setComment(res.data.comment || '');
        })
        .catch(() => setComment(''));
    } else {
      setComment('');
    }
  }, [order, show,axiosInstance]);

  const handleClose = () => {
    setComment('');
    setAlert({ show: false, variant: '', message: '' });
    onHide();
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setAlert({ show: true, variant: 'info', message: returnTitle('create_wo.empty_reason') });
      return;
    }

    setLoading(true);
    const method = order?.last_status?.latest_action === 'WORK_ORDER_REFUSED_BY_NACH_OTDEL' ? 'put' : 'post';

    try {
      await axiosInstance[method](`/work-order/${order.wo_id}/refuse-finished-work-order/`, {
        comment: comment.trim(),
      });

      setLocked(true); // ✅ UI lock
      setAlert({
        show: true,
        variant: 'success',
        message: returnTitle(
          method === 'put' ? 'complete_wo.refusal_updated' : 'complete_wo.refused_success'
        ),
      });
      setTimeout(() => {
        handleClose();
        onRefuse();
      }, 1000);
    } catch (err) {
      setAlert({
        show: true,
        variant: 'info',
        message: returnTitle('complete_wo.refusal_failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      contentClassName="custom-modal-content"
      backdropClassName="custom-backdrop"
    >
      <Modal.Body className="p-4">
        <h5 className="text-danger mb-4">
          {returnTitle(
            order?.last_status?.latest_action === 'WORK_ORDER_REFUSED_BY_NACH_OTDEL'
              ? 'complete_wo.update_refusal'
              : 'complete_wo.refuse_work_order'
          )}
        </h5>

        {alert.show && (
          <Alert
            variant={alert.variant}
            message={alert.message}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        )}

        <Form.Group className="mb-4">
          <Form.Label className="text-light small">
            {returnTitle('complete_wo.refusal_reason_for')}{' '}
            <span className="text-info">"{order?.wo_name}"</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            className="bg-transparent border text-light custom-textarea rounded"
            placeholder={returnTitle('complete_wo.enter_reason')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ pointerEvents: 'auto' }}
          />
        </Form.Group>

        <div className="d-flex justify-content-end gap-3">
          <Button variant="outline-secondary" onClick={handleClose} className="rounded-2 px-4" disabled={loading}>
            {returnTitle('app.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            className="rounded-2 px-4"
            disabled={loading || locked || !comment.trim()}
          >
            {loading ? returnTitle('complete_wo.sending') : returnTitle('complete_wo.confirm_refusal')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
