import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';
import { FcKey } from "react-icons/fc";

export default function ChangePasswordModal({ show, onHide }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = createAxiosInstance(navigate, setUser, setAccessToken);

  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (show) {
      setAlert(null);
      setLocked(false);
      setForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const { oldPassword, newPassword, confirmPassword } = form;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setAlert({ type: 'danger', message: returnTitle('change_pass.fill_all_fields') });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlert({ type: 'danger', message: returnTitle('change_pass.passwords_do_not_match') });
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setAlert({ type: 'success', message: returnTitle('change_pass.password_changed_successfully') });
      setLocked(true);
      setTimeout(() => {
        onHide();
        setSubmitting(false);
        setAlert(null);
      }, 1500);
    } catch (err) {
      const msg = returnTitle(err?.response?.data?.detail || 'change_pass.failed');
      setAlert({ type: 'danger', message: msg });
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="custom-fin-modal">
      <Modal.Header closeButton>
        <Modal.Title><FcKey className='text-info'/>{' '}{returnTitle('change_pass.change_password')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {alert && <Alert type={alert.type} message={alert.message} />}
        <Form.Group className="mb-3">
          <Form.Label>{returnTitle('change_pass.old_password')}</Form.Label>
          <Form.Control
            type="password"
            name="oldPassword"
            value={form.oldPassword}
            onChange={handleChange}
            className="bg-transparent text-light border"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>{returnTitle('change_pass.new_password')}</Form.Label>
          <Form.Control
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="bg-transparent text-light border"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>{returnTitle('change_pass.confirm_password')}</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="bg-transparent text-light border"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          {returnTitle('app.cancel')}
        </Button>
        <Button variant="success" onClick={handleSubmit} disabled={submitting || locked}>
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {returnTitle('app.changing')}...
            </>
          ) : (
            returnTitle('app.change')
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
