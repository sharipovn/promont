import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Modal, Table, Button, Spinner } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { formatDateTime } from '../utils/formatDateTime';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { FaEdit, FaTrash } from 'react-icons/fa';
import HoverText from './HoverText';
import Alert from './Alert';
import HoverTooltip from './HoverTooltip'

import CreatePositionModal from './CreatePositionModal';
import UpdatePositionModal from './UpdatePositionModal';
import DeletePositionModal from './DeletePositionModal';

export default function DepartmentPositionsModal({ show, onHide, department,onUpdated }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const axiosInstance = useMemo(() => createAxiosInstance(null, setUser, setAccessToken), [setUser, setAccessToken]);

  // ✅ useCallback version of fetchPositions
  const fetchPositions = useCallback(() => {
    if (department?.department_id) {
      setLoading(true);
      axiosInstance
        .get(`/job-positions/department/${department.department_id}/`)
        .then((res) => setPositions(res.data))
        .catch((err) => {
          console.error('❌ Failed to load positions:', err);
          setError(`${returnTitle('error.failed_to_load')}: ${err?.response?.data?.detail || 'Server error'}`);
        })
        .finally(() => setLoading(false));
    }
  }, [axiosInstance, department?.department_id, returnTitle]);

  useEffect(() => {
    if (show) {
      setError('');
      fetchPositions();
    }
  }, [show, department, fetchPositions]);

  const handleAdd = () => setShowCreate(true);
  const handleEdit = (pos) => {
    setSelectedPosition(pos);
    setShowUpdate(true);
  };
  const handleDelete = (pos) => {
    setSelectedPosition(pos);
    setShowDelete(true);
  };



  return (
    <>
      <Modal show={show} onHide={() => {
            onHide?.(); // Call parent's close handler
            onUpdated?.();
          }} centered size="xl">
        <Modal.Header closeButton style={{ backgroundColor: '#2e3a4b', color: 'white' }}>
          <Modal.Title>
            {returnTitle('add_depart.positions_of')} {department?.department_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#2e3a4b', color: 'white' }}>
          {error && <Alert type="danger" message={error} />}

          <div className="d-flex justify-content-end mb-2">
            <Button variant="success" size="sm" onClick={handleAdd}>
              ➕ {returnTitle('add_depart.add_position')}
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-light">
              <Spinner animation="border" size="sm" className="me-2" />
              {returnTitle('app.loading')}
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center text-light">{returnTitle('add_depart.no_positions')}</div>
          ) : (
            <Table bordered hover responsive variant="dark">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{returnTitle('add_depart.position_name')}</th>
                  <th>{returnTitle('add_depart.position_description')}</th>
                  <th>{returnTitle('add_depart.parent_position')}</th>
                  <th>{returnTitle('add_depart.create_user')}</th>
                  <th>{returnTitle('add_depart.create_time')}</th>
                  <th>{returnTitle('add_depart.update_time')}</th>
                  <th>{returnTitle('add_depart.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, idx) => (
                  <tr key={pos.position_id}>
                    <td>{idx + 1}</td>
                    <td><HoverTooltip>{pos.position_name}</HoverTooltip></td>
                    <td>
                        <HoverTooltip>{pos.position_description || '—'}</HoverTooltip>
                    </td>
                    <td><HoverText>{pos.parent_name || '—'}</HoverText></td>
                    <td><HoverText>{pos.create_user_fio || '—'}</HoverText></td>
                    <td><HoverText>{formatDateTime(pos.create_time)}</HoverText></td>
                    <td><HoverText>{formatDateTime(pos.update_time)}</HoverText></td>
                    <td className="text-center">
                      <span
                        onClick={() => handleEdit(pos)}
                        className="me-2 d-inline-flex align-items-center justify-content-center text-warning border border-warning rounded"
                        style={{ width: '32px', height: '32px', cursor: 'pointer' }}
                      >
                        <FaEdit />
                      </span>
                      <span
                        onClick={() => handleDelete(pos)}
                        className="d-inline-flex align-items-center justify-content-center text-danger border border-danger rounded"
                        style={{ width: '32px', height: '32px', cursor: 'pointer' }}
                      >
                        <FaTrash />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>

      {/* Modals */}
      <CreatePositionModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        department={department}
        onCreated={fetchPositions}
      />
      <UpdatePositionModal
        show={showUpdate}
        onHide={() => setShowUpdate(false)}
        department={department}
        position={selectedPosition}
        onUpdated={fetchPositions}
      />
      <DeletePositionModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        position={selectedPosition}
        onDeleted={fetchPositions}
      />
    </>
  );
}
