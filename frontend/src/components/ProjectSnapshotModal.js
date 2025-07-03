import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaUser, FaInfoCircle } from 'react-icons/fa';
import { formatDateTime } from '../utils/formatDateTime';
import { useI18n } from '../context/I18nProvider';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';

export default function ProjectSnapshotModal({ show, onHide, historyId }) {
  const { returnTitle } = useI18n();
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && historyId) {
      setLoading(true);
      setError('');
      setSnapshot(null);
      axiosInstance
        .get(`/admin-panel/project-snapshot/${historyId}/`)
        .then((res) => setSnapshot(res.data))
        .catch(() => setError('❌ ' + returnTitle('audit_log.snapshot_error')))
        .finally(() => setLoading(false));
    }
  }, [show, historyId, axiosInstance, returnTitle]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" dialogClassName="custom-fin-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaInfoCircle className="me-2" />
          {returnTitle('audit_log.snapshot_title')}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error ? (
          <div className="text-danger">{error}</div>
        ) : loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="info" style={{ width: '3rem', height: '3rem' }} />
          </div>
        ) : snapshot ? (
          <div className="table-responsive rounded-4 custom-scroll" style={{ backgroundColor: '#2e3a4b', border: '1px solid rgba(255,255,255,0.05)'}}>
            <table className="custom-dark-table table-bordered w-100">
  <tbody>
    <tr>
      <th>{returnTitle('audit_log.project_id')}</th>
      <td>{snapshot.project_code}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.project_name')}</th>
      <td>{snapshot.project_name}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.contract_number')}</th>
      <td>{snapshot.contract_number}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.total_price')}</th>
      <td>{snapshot.total_price?.toLocaleString() || '-'}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.currency')}</th>
      <td>{snapshot?.currency_name || '-'}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.start_date')}</th>
      <td>{snapshot?.start_date || '-'}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.end_date')}</th>
      <td>{snapshot?.end_date || '-'}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.financier')}</th>
      <td>{snapshot?.financier_name || '-'}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.financier_confirm')}</th>
      <td>{snapshot?.financier_confirm ? returnTitle('app.yes') : returnTitle('app.no')}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.financier_confirm_date')}</th>
      <td>{snapshot?.financier_confirm_date || '-'}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.project_gip_name')}</th>
      <td>{snapshot?.project_gip_name || '-'}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.gip_confirm')}</th>
      <td>{snapshot?.gip_confirm ? returnTitle('app.yes') : returnTitle('app.no')}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.gip_confirm_date')}</th>
      <td>{snapshot.gip_confirm_date || '-'}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.partner')}</th>
      <td>{snapshot?.partner_name || '-'}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.create_user')}</th>
      <td>{snapshot.create_username || '-'}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.create_date')}</th>
      <td>{formatDateTime(snapshot?.create_date)}</td>
    </tr>
    <tr>
      <th>{returnTitle('audit_log.update_date')}</th>
      <td>{formatDateTime(snapshot?.update_date)}</td>
    </tr>
  </tbody>
</table>

          </div>
        ) : (
          <div>{returnTitle('app.loading')}...</div>
        )}
      </Modal.Body>
    </Modal>
  );
}
