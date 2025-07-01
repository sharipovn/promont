import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CiSearch } from 'react-icons/ci';
import { useI18n } from '../context/I18nProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { formatDateOnly,formatDateTime } from '../utils/formatDateTime';
import CustomPagination from './CustomPagination';
import Alert from './Alert'; // ✅ custom alert
import HoverText from './HoverText'; // ✅ custom alert
import Spinner from 'react-bootstrap/Spinner';
import CreateNewUserModal from './CreateNewUserModal';
import AdminUpdateUserModal from './AdminUpdateUserModal';
import SetUserPasswordModal from './SetUserPasswordModal';
import PauseUserModal from './PauseUserModal';


import './TranslationTable.css';
import { FaCheckCircle, FaTimesCircle, FaPauseCircle, FaPlayCircle, FaEdit,FaPlus,FaKey } from 'react-icons/fa';




export default function AdminUsers() {
  const { returnTitle } = useI18n();
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [alertMsg, setAlertMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [actionMode, setActionMode] = useState('pause');




  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setAlertMsg('');
    axiosInstance
      .get('/admin-users/', {
        params: {
          page: currentPage,
          search: search.trim() || undefined,
        },
      })
      .then((res) => {
        setUsers(res.data.results);
        setTotalUsersCount(res.data.count);
        setTotalPages(Math.ceil(res.data.count / 15));
        setAlertMsg('');
      })
      .catch((err) => {
        console.error('❌ Failed to load users:', err);
        setAlertMsg('❌ ' + returnTitle('admin_panel.fetch_error'));
      })
      .finally(() => setLoading(false));
  }, [axiosInstance, search, currentPage, returnTitle]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div>
      <h6 className="text-light mb-3">
        👤 {returnTitle('admin_panel.user_management')} ({totalUsersCount})
      </h6>

      {/* Search Bar */}
      {/* Search bar + Add button row */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        {/* Search Bar */}
        <div className="translation-search-wrapper" style={{ maxWidth: '400px' }}>
          <CiSearch className="search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setCurrentPage(1);
            }}
            className="translation-search-input"
            placeholder={returnTitle('admin_panel.username_or_fio')}
          />
        </div>

        {/* Add User Button */}
        <button
          className="btn btn-success d-flex align-items-center gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus />
          {returnTitle('admin_panel.add_user')}
        </button>

      </div>


      {/* Alert Message */}
      {alertMsg && <Alert message={alertMsg} />}

      {/* Spinner */}
      {loading && (
        <div className="text-center py-3">
            <Spinner
            animation="border"
            variant="info"
            style={{ width: '3.5rem', height: '3.5rem' }}
            />
        </div>
        )}


      {/* Table */}
      {!loading && (
        <div
          className="table-responsive rounded-4 custom-scroll"
          style={{
            backgroundColor: '#2e3a4b',
            border: '1px solid rgba(255,255,255,0.05)',
            maxHeight: '70vh',
          }}
        >
          <table className="custom-dark-table w-100">
            <thead>
                <tr className="text-uppercase small">
                <th>#</th>
                <th>{returnTitle('admin_panel.id')}</th>
                <th>{returnTitle('admin_panel.username')}</th>
                <th>{returnTitle('admin_panel.fio')}</th>
                <th>{returnTitle('admin_panel.phone')}</th>
                <th>{returnTitle('admin_panel.role')}</th>
                <th>{returnTitle('admin_panel.active')}</th>
                <th>{returnTitle('admin_panel.superuser')}</th>
                <th>{returnTitle('admin_panel.creator')}</th>
                <th>{returnTitle('admin_panel.created')}</th>
                <th>{returnTitle('admin_panel.updated')}</th>
                <th>{returnTitle('admin_panel.actions')}</th>
                </tr>
            </thead>
            <tbody>
                {users.map((u, index) => (
                <tr key={u.user_id}>
                    <td>{(currentPage - 1) * 15 + index + 1}</td>
                    <td>{u.user_id}</td>
                    <td>{u.username}</td>
                    <td><HoverText>{u.fio}</HoverText></td>
                    <td>{u.phone_number}</td>
                    <td>{u.role_name || '—'}</td>
                    <td className="text-center">
                    {u.is_active ? (
                        <FaCheckCircle className="text-success" />
                    ) : (
                        <FaTimesCircle className="text-danger" />
                    )}
                    </td>
                    <td>  {u.is_superuser ? (
                            <FaCheckCircle className="text-info" />
                        ) : (
                            '—'
                        )}</td>
                    <td>{u.create_user_fio || '—'}</td>
                    <td>{formatDateTime(u.create_time)}</td>
                    <td>{formatDateTime(u.update_time)}</td>
                    {/* ✅ Actions column */}
                    <td>
                      {!u.is_superuser && (
                        <div className="d-flex gap-4">
                          {u.is_active ? (
                            <FaPauseCircle
                              className="text-warning cursor-pointer"
                              title={returnTitle('admin_panel.pause')}
                              onClick={() => {
                                  setActionMode('pause');
                                  setTargetUser(u);
                                }}
                            />
                          ) : (
                            <FaPlayCircle
                              className="text-success cursor-pointer"
                              title={returnTitle('admin_panel.activate')}
                              onClick={() => {
                                setActionMode('activate');
                                setTargetUser(u);
                              }}
                            />
                          )}
                          <FaEdit
                            className="text-primary cursor-pointer"
                            title={returnTitle('admin_panel.edit')}
                            onClick={() => handleEditUser(u)}
                          />
                          <FaKey
                              className="text-warning cursor-pointer"
                              title={returnTitle('admin_panel.set_password')}
                              onClick={() => setSelectedUserForPassword(u)}
                            />
                        </div>
                      )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>

        </div>
      )}

      <CreateNewUserModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onCreated={fetchUsers}
      />
      <AdminUpdateUserModal
        show={!!editingUser}
        user={editingUser}
        onHide={() => setEditingUser(null)}
        onUpdated={fetchUsers}
      />
      <SetUserPasswordModal
        show={!!selectedUserForPassword}
        user={selectedUserForPassword}
        onHide={() => setSelectedUserForPassword(null)}
      />
      <PauseUserModal
        show={!!targetUser}
        user={targetUser}
        onHide={() => setTargetUser(null)}
        onUpdated={fetchUsers}
        mode={actionMode}
      />

      {/* Pagination */}
      {!loading && (
        <div className="d-flex justify-content-center mt-4">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
