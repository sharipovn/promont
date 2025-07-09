// DeleteUserModal.js
import React, { useState, useMemo } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import Alert from './Alert';

export default function DeleteUserModal({ show, user, onHide, onDeleted }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const [alertMsg, setAlertMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!user?.user_id) return;

    setSubmitting(true);
    setAlertMsg('');

    try {
      await axiosInstance.delete(`/admin-users/delete/${user.user_id}/`);
      setAlertMsg(returnTitle('delete_user.deleted_successfully'));
      onDeleted?.();
      setTimeout(() => {
        onHide();
        setSubmitting(false);
        setAlertMsg('');
      }, 1000);
    } catch (err) {
      console.error(err);
      setAlertMsg('❌ ' + (err.response?.data?.detail || returnTitle('delete_user.failed')));
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" dialogClassName="custom-fin-modal">
      <Modal.Body className="p-4 text-light">
        <h5 className="text-danger mb-3">{returnTitle('delete_user.delete_user_title')}</h5>

        {alertMsg && <Alert message={alertMsg} />}

        <div className="mb-3">
            <p>{returnTitle('delete_user.confirm_message')}</p>
            <div className="px-2">
                <div className="row mb-2">
                <div className="col-4  nowrap-cell">{returnTitle('create_user.username')}:</div>
                <div className="col-8 text-info fw-semibold">{user?.username || '—'}</div>
                </div>
                <div className="row mb-2">
                <div className="col-4 ">{returnTitle('create_user.fio')}:</div>
                <div className="col-8 text-info fw-semibold">{user?.fio || '—'}</div>
                </div>
                {user?.role_name && (
                <div className="row mb-2">
                    <div className="col-4">{returnTitle('create_user.role')}:</div>
                    <div className="col-8 text-info fw-semibold">{user.role_name}</div>
                </div>
                )}
            </div>
            </div>


        <div className="d-flex justify-content-between mt-4">
          <Button variant="outline-light" onClick={onHide} disabled={submitting}>
            {returnTitle('app.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                {returnTitle('delete_user.deleting') + '...'}
              </>
            ) : returnTitle('app.confirm')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
