import React, { useState,useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';

export default function SetUserPasswordModal({ show, onHide, user }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = createAxiosInstance(navigate, setUser, setAccessToken);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);

    useEffect(() => {
        if (show) {
            setAlertMsg('');
            setPassword('');
            setConfirmPassword('');
            setLocked(false);
            setSubmitting(false);
        }
        }, [show]);



 const handleSubmit = async () => {
    setAlertMsg('');

    if (!password || !confirmPassword) {
        setAlertMsg('❌ ' + returnTitle('create_user.password_required'));
        return;
    }

    if (password !== confirmPassword) {
        setAlertMsg('❌ ' + returnTitle('create_user.password_mismatch'));
        return;
    }

    if (password.length < 8) {
        setAlertMsg('❌ ' + returnTitle('create_user.password_rule_length'));
        return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
        setAlertMsg('❌ ' + returnTitle('create_user.password_rule_upper_lower'));
        return;
    }

    if (!/\d/.test(password)) {
        setAlertMsg('❌ ' + returnTitle('create_user.password_rule_number'));
        return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        setAlertMsg('❌ ' + returnTitle('create_user.password_rule_symbol'));
        return;
    }

    setSubmitting(true);
    try {
        await axiosInstance.post(`/admin-users/set-password/${user.user_id}/`, {
        password,
        confirm_password: confirmPassword,
        });

        setAlertMsg(returnTitle('create_user.password_set_success'));
        setLocked(true);
        setTimeout(() => {
        setSubmitting(false);
        onHide();
        setPassword('');
        setConfirmPassword('');
        setAlertMsg('');
        }, 1200);
    } catch (err) {
        setAlertMsg('❌ ' + (err.response?.data?.detail || returnTitle('create_user.password_set_failed')));
        setSubmitting(false);
    }
    };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="md" dialogClassName="custom-fin-modal">
      <Modal.Body className="p-4 text-light">
        <h5 className="text-warning mb-3">{returnTitle('create_user.set_password_for')} {user?.username}</h5>

        {alertMsg && <Alert message={alertMsg} type="info" />}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="text-light">{returnTitle('create_user.new_password')}</Form.Label>
            <Form.Control
              type="password"
              value={password}
              className="bg-transparent border text-light"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-light">{returnTitle('create_user.confirm_password')}</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              className="bg-transparent border text-light"
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Form.Group>

          <ul className="small text-info ps-3 mb-4">
            <li>{returnTitle('create_user.password_rule_upper_lower')}</li>
            <li>{returnTitle('create_user.password_rule_number')}</li>
            <li>{returnTitle('create_user.password_rule_symbol')}</li>
            <li>{returnTitle('create_user.password_rule_length')}</li>
          </ul>

          <div className="d-flex justify-content-between">
            <Button variant="outline-light" onClick={onHide} disabled={submitting}>
              {returnTitle('app.cancel')}
            </Button>
            <Button variant="warning" onClick={handleSubmit} disabled={submitting || locked}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  {returnTitle('app.setting') + '...'}
                </>
              ) : returnTitle('create_user.set_password')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
