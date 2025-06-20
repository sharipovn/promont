import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import Alert from './Alert';

export default function DeletePositionModal({ show, onHide, position, onDeleted }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const axiosInstance = useMemo(() => createAxiosInstance(null, setUser, setAccessToken), [setUser, setAccessToken]);

  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDelete = () => {
    setSubmitting(true);
    setLocked(true);
    axiosInstance.delete(`/job-positions/${position.position_id}/`)
      .then(() => {
        setSuccess(returnTitle('add_depart.position_deleted_successfully'));
        setTimeout(() => {
          onDeleted?.();
          onHide?.();
        }, 1500);
      })
      .catch(err => {
        setError(err?.response?.data?.detail || '❌ Server error');
        setSubmitting(false);
        setLocked(false);
      });
  };

  useEffect(() => {
    if (!show) {
      setError('');
      setSuccess('');
      setSubmitting(false);
      setLocked(false);
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" dialogClassName="custom-fin-modal">
      <Modal.Header closeButton style={{ backgroundColor: '#2a3b4d', color: 'white' }}>
        <Modal.Title>{returnTitle('add_depart.delete_position')}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: '#2a3b4d', color: 'white' }}>
        {success && <Alert type="success" message={success} />}
        {error && <Alert type="danger" message={error} />}
        <p>{returnTitle('add_depart.confirm_delete_position')} <strong>{position?.position_name}</strong>?</p>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#2a3b4d' }}>
        <Button variant="secondary" onClick={onHide} disabled={locked}>
          {returnTitle('app.cancel')}
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={submitting || locked}>
          {submitting ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              {returnTitle('app.deleting')}...
            </>
          ) : returnTitle('app.delete')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
