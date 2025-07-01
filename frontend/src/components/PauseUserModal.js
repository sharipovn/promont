import React, { useState,useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';

export default function PauseUserModal({ show, onHide, user, onUpdated, mode = 'pause' }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = createAxiosInstance(navigate, setUser, setAccessToken);

  const [alertMsg, setAlertMsg] = useState('');
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    if (show) {
        setAlertMsg('');
    }
    }, [show]);


const handleConfirm = async () => {
    setAlertMsg('');
    setLoading(true);
    try {
        const url =
        mode === 'pause'
            ? `/admin-users/pause/${user.user_id}/`
            : `/admin-users/activate/${user.user_id}/`;

        await axiosInstance.post(url);

        const successMsg =
        mode === 'pause'
            ? returnTitle('admin_panel.user_paused_successfully')
            : returnTitle('admin_panel.user_activated_successfully');

        setAlertMsg('✅ ' + successMsg);

        setTimeout(() => {
        onUpdated?.();
        onHide();
        }, 1500);
    } catch (err) {
        setAlertMsg('❌ ' + (err.response?.data?.detail || returnTitle('admin_panel.action_failed')));
    } finally {
        setLoading(false);
    }
    };


  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      size="md"
      dialogClassName="custom-fin-modal" // ✅ Apply custom modal style
    >
      <Modal.Body className="text-light p-4">
        <h5 className="text-warning mb-3">
            {mode === 'pause'
            ? returnTitle('admin_panel.confirm_pause_title')
            : returnTitle('admin_panel.confirm_activate_title')}
        </h5>

        {alertMsg && <Alert message={alertMsg} type="danger" />}

        <p className="mb-4">
            {mode === 'pause'
            ? `${returnTitle('admin_panel.confirm_pause_message')}  ${user?.fio || user?.username} ?`
            : `${returnTitle('admin_panel.confirm_activate_message')}  ${user?.fio || user?.username} ?`}
        </p>

        <div className="d-flex justify-content-between">
            <Button variant="outline-light" onClick={onHide} disabled={loading}>
            {returnTitle('app.cancel')}
            </Button>
            <Button
            variant={mode === 'pause' ? 'warning' : 'success'}
            onClick={handleConfirm}
            disabled={loading}
            >
            {loading ? (
                <span className="spinner-border spinner-border-sm" />
            ) : mode === 'pause'
                ? returnTitle('admin_panel.confirm_pause')
                : returnTitle('admin_panel.confirm_activate')}
            </Button>
        </div>
        </Modal.Body>

    </Modal>
  );
}
