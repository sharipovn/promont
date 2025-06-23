import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import Alert from './Alert';

export default function MakeVacationModal({ show, onHide, staff, onUpdated }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setWarning('');
      setSuccess('');
      setError('');
      setStartDate('');
      setEndDate('');
      setLocked(false);
      setSubmitting(false);
    }
  }, [show]);

  const toggleVacation = () => {
    setWarning('');
    setSuccess('');
    setError('');

    if (!staff.on_vocation && (!startDate || !endDate)) {
      setWarning(returnTitle('staff.vacation_dates_required'));
      return;
    }

    const payload = {
      on_vocation: !staff.on_vocation,
      on_vocation_start: staff.on_vocation ? null : startDate,
      on_vocation_end: staff.on_vocation ? null : endDate,
    };

    setSubmitting(true);
    axiosInstance
      .patch(`/manage-staff/staff-users/${staff.user_id}/toggle-vacation/`, payload)
      .then(() => {
        setSuccess(returnTitle('staff.vacation_status_updated_successfully'));
        onUpdated?.();
        setLocked(true);
        setTimeout(() => onHide(), 1200);
      })
      .catch((err) => {
        console.error(err);
        setError(returnTitle('staff.vacation_status_update_failed'));
      })
      .finally(() => setSubmitting(false));
  };

  const inputStyle = {
    backgroundColor: '#1f2a38',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    borderRadius: '8px',
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ backgroundColor: '#2e3a4b', color: 'white' }}>
        <Modal.Title>
          {staff.on_vocation
            ? returnTitle('staff.remove_vacation')
            : returnTitle('staff.make_vacation')}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: '#2e3a4b', color: 'white' }}>
        {success && <Alert type="success" message={success} />}
        {error && <Alert type="danger" message={error} />}
        {warning && <div className="text-danger text-center">{warning}</div>}

        <p className="mb-3">
          {staff.on_vocation
            ? returnTitle('staff.confirm_remove_vacation')
            : returnTitle('staff.confirm_make_vacation')}
        </p>

        {!staff.on_vocation && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>{returnTitle('staff.vacation_start')}</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
                disabled={locked}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{returnTitle('staff.vacation_end')}</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
                disabled={locked}
              />
            </Form.Group>
          </>
        )}
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: '#2e3a4b' }}>
        <Button variant="secondary" onClick={onHide} disabled={locked}>
          {returnTitle('app.cancel')}
        </Button>
        <Button
          variant={staff.on_vocation ? 'danger' : 'success'}
          onClick={toggleVacation}
          disabled={submitting || locked}
        >
          {submitting ? (
            <Spinner size="sm" animation="border" />
          ) : staff.on_vocation ? (
            returnTitle('staff.remove_vacation')
          ) : (
            returnTitle('staff.make_vacation')
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
