import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import Alert from './Alert';
import { FaInfoCircle } from 'react-icons/fa';

export default function EditDepartmentModal({ show, onHide, department, onUpdated }) {
  const { returnTitle } = useI18n();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [
    navigate, setUser, setAccessToken,
  ]);

  useEffect(() => {
    if (department) {
      setName(department.department_name);
      setParentId(department.parent || '');
    }
  }, [department]);

  useEffect(() => {
    if (show) {
      setError('');
      setSuccess('');
      setIsSubmitting(false);
      setLocked(false);
      axiosInstance.get('/departments/').then((res) => {
        const filtered = res.data.results.filter((d) => d.department_id !== department?.department_id);
        setDepartments(filtered);
      });
    }
  }, [show, axiosInstance, department]);

  const handleSubmit = async () => {
    if (!name) {
      setError(returnTitle('add_depart.department_name_required'));
      return;
    }

    setIsSubmitting(true);
    setLocked(true);
    try {
      await axiosInstance.put(`/departments/${department.department_id}/update/`, {
        department_name: name,
        parent: parentId || null,
      });

      setSuccess(returnTitle('add_depart.department_updated_successfully'));
      setTimeout(() => {
        onUpdated?.();
        onHide();
        setIsSubmitting(false);
        setLocked(false);
      }, 1500);
    } catch (err) {
      setError(returnTitle('add_depart.update_department_failed'));
      setIsSubmitting(false);
      setLocked(false);
    }
  };

  const selectStyle = {
    backgroundColor: '#1f2a38',
    borderColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    borderRadius: '8px'
  };

  return (
    <>
      {error && <Alert type="danger" message={error} />} 
      {success && <Alert type="info" message={success} />} 
      <Modal
        show={show}
        onHide={onHide}
        backdrop="static"
        centered
        size="md"
        dialogClassName="custom-fin-modal"
      >
        <Modal.Body className="p-4 text-light">
          <h5 className="text-light mb-4">{returnTitle('add_depart.update_department')}</h5>
          <Form.Group className="mb-3">
            <Form.Label>{returnTitle('add_depart.department_name')}</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={locked}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>{returnTitle('add_depart.parent_department')}</Form.Label>
            <Form.Select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              disabled={locked}
              style={selectStyle}
              placeholder={returnTitle('add_depart.choose_parent_department')}
            >
              <option value="">{returnTitle('add_depart.choose_parent_or_null')}</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.department_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <span className="text-info d-flex align-items-center mt-2 mb-3 ms-1" style={{ fontSize: '0.85em' }}>
            <FaInfoCircle className="me-1" /> {returnTitle('add_depart.parent_can_be_null')}
          </span>

          <div className="d-flex justify-content-between">
            <Button variant="outline-light" onClick={onHide} disabled={locked}>
              {returnTitle('app.cancel')}
            </Button>
            <Button variant="success" onClick={handleSubmit} disabled={locked}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  {returnTitle('app.updating')}...
                </>
              ) : (
                returnTitle('app.update')
              )}
            </Button>

          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
