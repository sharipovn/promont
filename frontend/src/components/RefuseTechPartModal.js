import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Alert from './Alert';
import { useMemo } from 'react';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useI18n } from '../context/I18nProvider';

export default function RefuseTechPartModal({ show, onHide, part, onRefuse }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
const axiosInstance = useMemo(() => {return createAxiosInstance(navigate, setUser, setAccessToken);
    }, [navigate, setUser, setAccessToken]);

  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [lock, setLock] = useState(false); // ✅ prevent resubmission after success



  // Load existing comment if already refused
  useEffect(() => {
    if (show) {
      setComment('');
      setLock(false); // ✅ reset on modal open
      setAlert({ show: false, variant: '', message: '' });

      if (part?.last_status?.latest_action === 'TECH_PART_REFUSED') {
        axiosInstance
          .get(`/work-order/tech-parts/${part.tch_part_code}/`)
          .then((res) => {
            setComment(res.data.comment || '');
          })
          .catch(() => {
            setComment('');
          });
      }
    }
  }, [part, show, axiosInstance]);


  const handleClose = () => {
    setComment('');
    setAlert({ show: false, variant: '', message: '' });
    onHide();
  };

  const handleSubmit = async () => {
    if (!comment.trim() || lock) return; // ✅ prevent resubmission

    setLoading(true);
    const method = part?.last_status?.latest_action === 'TECH_PART_REFUSED' ? 'put' : 'post';
    try {
      await axiosInstance[method](`/work-order/tech-parts/${part.tch_part_code}/`, {
        comment: comment.trim(),
      });

      setAlert({
        show: true,
        variant: 'success',
        message: returnTitle(
          method === 'put' ? 'create_wo.refusal_updated' : 'create_wo.refused_success'
        ),
      });

      setLock(true); // ✅ lock after success
      setTimeout(() => {
        handleClose();
        onRefuse(); // refresh list
      }, 1000);
    } catch (err) {
      setAlert({
        show: true,
        variant: 'info',
        message: returnTitle('create_wo.refusal_failed'),
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
            part?.last_status?.latest_action === 'TECH_PART_REFUSED'
              ? 'create_wo.update_refusal'
              : 'create_wo.refuse_part'
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
            {returnTitle('create_wo.refusal_reason_for')}{' '}
            <span className="text-info">"{part?.tch_part_name}"</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            className="bg-transparent border text-light custom-textarea rounded"
            placeholder={returnTitle('create_wo.enter_reason')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ pointerEvents: 'auto' }} // ✅ Make sure it's editable
          />
        </Form.Group>

        <div className="d-flex justify-content-end gap-3">
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            className="rounded-2 px-4"
            disabled={loading}
          >
            {returnTitle('app.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            className="rounded-2 px-4"
            disabled={loading || lock || !comment.trim()} // ✅ lock after success
          >
            {loading ? returnTitle('create_wo.sending') : returnTitle('create_wo.confirm_refusal')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
