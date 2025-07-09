import React, { useState, useEffect, useMemo } from 'react';
import { FaEye } from 'react-icons/fa';
import './TranslationTable.css';
import CustomPagination from './CustomPagination';
import Alert from './Alert';
import Spinner from 'react-bootstrap/Spinner';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { formatDateTime } from '../utils/formatDateTime';
import UserSnapshotModal from './UserSnapshotModal'; // ⬅️ You will need to implement this
import { TiStarFullOutline } from "react-icons/ti";
import { FaPlusCircle, FaMinusCircle } from 'react-icons/fa';








export default function UserLogTable() {
  const { returnTitle } = useI18n();
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const [searchUsername, setSearchUsername] = useState('');
  const [searchFio, setSearchFio] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [snapshotModal, setSnapshotModal] = useState({ show: false, historyId: null });

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const fetchLogs = () => {
    setLoading(true);
    setAlertMsg('');
    axiosInstance
      .get('/admin-panel/user-logs/', {
        params: {
          page: currentPage,
          username: searchUsername || undefined,
          fio: searchFio || undefined,
          user_name: searchUser || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      })
      .then((res) => {
        setLogs(res.data.results);
        setTotalCount(res.data.count);
        setTotalPages(Math.ceil(res.data.count / 15));
      })
      .catch((err) => {
        console.error('Failed to fetch user logs', err);
        setAlertMsg('❌ ' + returnTitle('admin_panel.fetch_error'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, searchUsername, searchFio, searchUser, startDate, endDate]);

  return (
    <div>
      <h6 className="text-light mb-3">
        👤 {returnTitle('audit_log.user_logs')} ({totalCount})
      </h6>

      <div className="row align-items-end g-2 mb-3 col-10 text-light">
        <div className="col-3">
          <label className="form-label">{returnTitle('audit_log.filter_username')}</label>
          <input
            type="text"
            className="form-control text-light border border-secondary rounded"
            placeholder="username"
            value={searchUsername}
            style={{ backgroundColor: '#2e3a4b' }}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchUsername(e.target.value);
            }}
          />
        </div>

        <div className="col-3">
          <label className="form-label">{returnTitle('audit_log.filter_fio')}</label>
          <input
            type="text"
            className="form-control text-light border border-secondary rounded"
            placeholder="FIO"
            value={searchFio}
            style={{ backgroundColor: '#2e3a4b' }}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchFio(e.target.value);
            }}
          />
        </div>

        <div className="col-2">
          <label className="form-label">{returnTitle('audit_log.filter_changed_by')}</label>
          <input
            type="text"
            className="form-control text-light border border-secondary rounded"
            placeholder="user"
            value={searchUser}
            style={{ backgroundColor: '#2e3a4b' }}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchUser(e.target.value);
            }}
          />
        </div>

        <div className="col-2">
          <label className="form-label">{returnTitle('audit_log.filter_start_date')}</label>
          <input
            type="date"
            className="form-control text-light border border-secondary rounded"
            value={startDate}
            style={{ backgroundColor: '#2e3a4b' }}
            onChange={(e) => {
              setCurrentPage(1);
              setStartDate(e.target.value);
            }}
          />
        </div>

        <div className="col-2">
          <label className="form-label">{returnTitle('audit_log.filter_end_date')}</label>
          <input
            type="date"
            className="form-control text-light border border-secondary rounded"
            value={endDate}
            style={{ backgroundColor: '#2e3a4b' }}
            onChange={(e) => {
              setCurrentPage(1);
              setEndDate(e.target.value);
            }}
          />
        </div>
      </div>

      {alertMsg && <Alert message={alertMsg} />}

      {loading ? (
        <div className="text-center py-3">
          <Spinner animation="border" variant="info" style={{ width: '3.5rem', height: '3.5rem' }} />
        </div>
      ) : (
        <div
          className="table-responsive rounded-4 custom-scroll"
          style={{ backgroundColor: '#2e3a4b', border: '1px solid rgba(255,255,255,0.05)', maxHeight: '50vh' }}
        >
          <table className="custom-dark-table w-100">
            <thead>
              <tr className="text-uppercase small">
                <th>#</th>
                <th>{returnTitle('audit_log.username')}</th>
                <th>{returnTitle('audit_log.fio')}</th>
                <th>{returnTitle('audit_log.role')}</th>
                <th>{returnTitle('audit_log.department')}</th>
                <th>{returnTitle('audit_log.operation')}</th> {/* ✅ Added */}
                <th>{returnTitle('audit_log.changed_by')}</th>
                <th>{returnTitle('audit_log.when')}</th>
                <th>{returnTitle('audit_log.field')}</th>
                <th>{returnTitle('audit_log.old_value')}</th>
                <th>{returnTitle('audit_log.new_value')}</th>
                <th>{returnTitle('audit_log.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={log?.history_id}>
                  <td>{(currentPage - 1) * 15 + idx + 1}</td>
                  <td>{log?.username || '-'}</td>
                  <td>{log?.fio || '-'}</td>
                  <td>{log?.role_name || '-'}</td>
                  <td>{log?.department_name || '-'}</td>
                  <td>
                    {{
                      '+': returnTitle('audit_log.created'),
                      '~': returnTitle('audit_log.updated'),
                      '-': returnTitle('audit_log.deleted'),
                    }[log?.history_type] || log?.history_type}
                  </td>
                  <td>{log?.changed_by || '-'}</td>
                  <td>{formatDateTime(log?.history_date)}</td>
                  <td>
                    {(log?.history_type === '+' || log?.history_type === '-')
                      ? returnTitle('audit_log.all_fields')
                      : (log?.field || '-')}
                  </td>

                  <td>
                    {(log?.history_type === '+' || log?.history_type === '-')
                      ? ''
                      : (log?.old_value || '-')}
                  </td>

                  <td>
                    {(log?.history_type === '+' || log?.history_type === '-')
                      ? ''
                      : (log?.new_value || '-')}
                  </td>

                  <td>
                    <FaEye
                      className="text-info cursor-pointer"
                      title={returnTitle('audit_log.view_snapshot')}
                      onClick={() =>
                        setSnapshotModal({ show: true, historyId: log.history_id })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        <div className="d-flex justify-content-center mt-4">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <UserSnapshotModal
        show={snapshotModal.show}
        historyId={snapshotModal.historyId}
        onHide={() => setSnapshotModal({ show: false, historyId: null })}
      />
    </div>
  );
}
