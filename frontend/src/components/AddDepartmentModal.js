import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import Alert from './Alert';
import { FaInfoCircle } from 'react-icons/fa';


export default function AddDepartmentModal({ show, onHide, onCreated }) {
  const { returnTitle } = useI18n();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  useEffect(() => {
    if (show) {
      setName('');
      setParentId(null);
      setError('');
      setSuccess('');
      setIsSubmitting(false);
      setLocked(false);
      axiosInstance.get('/parent-departments/').then((res) => {
        setDepartments(res.data || []);
      });
    }
  }, [show, axiosInstance]);

  const handleSubmit = async () => {
    if (!name) {
      setError(returnTitle('add_depart.department_name_required'));
      return;
    }

    setIsSubmitting(true);
    setLocked(true);
    try {
      await axiosInstance.post('/departments/', {
        department_name: name,
        parent: parentId || null,
      });

      setSuccess(returnTitle('add_depart.department_added_successfully'));
      setTimeout(() => {
        setName('');
        setParentId(null);
        setError('');
        setSuccess('');
        setIsSubmitting(false);
        setLocked(false);
        onCreated?.();
        onHide();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(returnTitle('add_depart.add_department_failed'));
      setIsSubmitting(false);
      setLocked(false);
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#1f2a38',
      borderColor: 'rgba(255,255,255,0.2)',
      color: 'white',
      borderRadius: '8px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#1f2a38',
      color: 'white',
    }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    placeholder: (base) => ({ ...base, color: '#ccc' }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#2c3e50' : '#1f2a38',
      color: 'white',
    }),
  };

  return (
    <>
      {error && <Alert type="danger" message={error} />} 
      {success && <Alert type="info" message={success} />} 
      <Modal show={show} onHide={onHide} backdrop="static" size="md" centered dialogClassName="custom-fin-modal">
        <Modal.Body className="p-4 text-light">
          <h5 className="text-light mb-4">{returnTitle('add_depart.add_department')}</h5>
          <Form.Group className="mb-3">
            <Form.Label>{returnTitle('add_depart.department_name')}</Form.Label>
            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={locked} />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>{returnTitle('add_depart.parent_department')}</Form.Label>
            <Select
              classNamePrefix="react-select"
              placeholder={returnTitle('add_depart.choose_parent_department')}
              className="text-light"
              styles={selectStyles}
              isClearable
              value={departments.find((d) => d.department_id === parentId) ? { label: departments.find((d) => d.department_id === parentId).department_name, value: parentId } : null}
              onChange={(opt) => setParentId(opt?.value || null)}
              options={departments.map((d) => ({ value: d.department_id, label: d.department_name }))}
              isDisabled={locked}
            />
          </Form.Group>
          <span className="text-info d-flex align-items-center mt-2 mb-2 ms-1" style={{ fontSize: '0.85em' }}>
            <FaInfoCircle className="me-1" />
            {returnTitle('add_depart.parent_can_be_null')}
          </span>
          <div className="d-flex justify-content-between">
            <Button variant="outline-light" onClick={onHide} disabled={locked}>{returnTitle('app.cancel')}</Button>
            <Button variant="success" onClick={handleSubmit} disabled={locked}>
              {isSubmitting ? <Spinner size="sm" animation="border" /> : returnTitle('app.create')}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
