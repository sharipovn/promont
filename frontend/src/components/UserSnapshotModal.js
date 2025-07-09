import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { formatDateTime } from '../utils/formatDateTime';

export default function UserSnapshotModal({ show, historyId, onHide }) {
  const { returnTitle } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  useEffect(() => {
    if (show && historyId) {
      setLoading(true);
      setData(null);
      setAlertMsg('');
      axiosInstance
        .get(`/admin-panel/user-snapshot/${historyId}/`)
        .then((res) => setData(res.data))
        .catch(() => {
          setAlertMsg('❌ ' + returnTitle('admin_panel.fetch_error'));
        })
        .finally(() => setLoading(false));
    }
  }, [show, historyId]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" dialogClassName="custom-fin-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaInfoCircle className="me-2" />
          {returnTitle('audit_log.user_snapshot')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {alertMsg ? (
          <div className="text-danger">{alertMsg}</div>
        ) : loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="info" style={{ width: '3rem', height: '3rem' }} />
          </div>
        ) : data ? (
          <div
            className="table-responsive rounded-4 custom-scroll"
            style={{ backgroundColor: '#2e3a4b', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <table className="custom-dark-table table-bordered w-100">
              <tbody>
                <tr>
                  <th>{returnTitle('admin.user_id')}</th>
                  <td>{data?.user_id || '-'}</td>
                </tr>
                <tr>
                  <th>{returnTitle('admin.username')}</th>
                  <td>{data?.username || '-'}</td>
                </tr>
                <tr>
                  <th>{returnTitle('admin.fio')}</th>
                  <td>{data?.fio || '-'}</td>
                </tr>
                <tr>
                  <th>{returnTitle('admin.phone')}</th>
                  <td>{data?.phone_number || '-'}</td>
                </tr>
                <tr>
                  <th>{returnTitle('admin.position')}</th>
                  <td>{data?.position_name || '-'}</td>
                </tr>
                <tr>
                  <th>{returnTitle('admin.role')}</th>
                  <td>{data?.role_name || '-'}</td>
                </tr>
                <tr>
                  <th>{returnTitle('admin.department')}</th>
                  <td>{data?.department_name || '-'}</td>
                </tr>
                <tr>
                  <th>{returnTitle('admin.is_active')}</th>
                  <td>{data?.is_active ? '✅' : '❌'}</td>
                </tr>
                <tr>
                  <th>{returnTitle('admin.is_superuser')}</th>
                  <td>{data?.is_superuser ? '✅' : '❌'}</td>
                </tr>
                <tr>
                  <th>{returnTitle('admin.created_by')}</th>
                  <td>{data?.create_username || '-'}</td>
                </tr>
                <tr>
                  <th>{returnTitle('audit_log.changed_by')}</th>
                  <td>{data?.changed_by || '-'}</td>
                </tr>
                <tr>
                  <th>{returnTitle('admin.create_time')}</th>
                  <td>{formatDateTime(data?.create_time)}</td>
                </tr>
                <tr>
                  <th>{returnTitle('admin.update_time')}</th>
                  <td>{formatDateTime(data?.update_time)}</td>
                </tr>
                <tr>
                  <th>{returnTitle('audit_log.when')}</th>
                  <td>{formatDateTime(data?.history_date)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div>{returnTitle('admin_panel.no_data')}</div>
        )}
      </Modal.Body>
    </Modal>
  );
}
