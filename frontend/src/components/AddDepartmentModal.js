import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import Alert from './Alert';
import DraggableModalDialog from './DraggableModalDialog';

export default function AddDepartmentModal({ show, onHide, onCreated }) {
  const { returnTitle } = useI18n();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  useEffect(() => {
    if (show) {
      axiosInstance.get('/departments/').then((res) => {
        setDepartments(res.data.results || []);
      });
    }
  }, [show, axiosInstance]);

  const handleSubmit = async () => {
    if (!name) {
      setError('❌ Please provide a department name');
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post('/departments/', {
        department_name: name,
        parent: parentId || null,
      });

      setSuccess('✅ Department added successfully.');
      setTimeout(() => {
        setName('');
        setParentId('');
        setError('');
        setSuccess('');
        onCreated?.();
        onHide();
        setIsSubmitting(false);
      }, 1500);
    } catch (err) {
      setError('❌ Failed to add department');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="info" message={success} />}
      <Modal show={show} onHide={onHide} backdrop="static" size="md" centered dialogClassName="custom-fin-modal">
        <Modal.Body className="p-4 text-light" dialogAs={DraggableModalDialog}>
          <h5 className="text-light mb-4">{returnTitle('add_depart.add_department')}</h5>
          <Form.Group className="mb-3">
            <Form.Label>{returnTitle('add_depart.department_name')}</Form.Label>
            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>{returnTitle('add_depart.parent_department')}</Form.Label>
            <Form.Select value={parentId} onChange={(e) => setParentId(e.target.value)} disabled={isSubmitting}>
              <option value="">{returnTitle('app.none')}</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <div className="d-flex justify-content-between">
            <Button variant="outline-light" onClick={onHide} disabled={isSubmitting}>{returnTitle('app.cancel')}</Button>
            <Button variant="success" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? returnTitle('app.creating') + '...' : returnTitle('app.create')}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
