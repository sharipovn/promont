import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { useI18n } from '../context/I18nProvider';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import Alert from './Alert';

export default function UpdatePositionModal({ show, onHide, department, position, onUpdated }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const axiosInstance = useMemo(() => createAxiosInstance(null, setUser, setAccessToken), [setUser, setAccessToken]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parent, setParent] = useState(null);
  const [parentOptions, setParentOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [lockUI, setLockUI] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (show && department) {
      setName(position?.position_name || '');
      setDescription(position?.position_description || '');
      setParent(position?.parent ? { value: position.parent, label: position.parent_name } : null);
      axiosInstance.get(`/job-positions/department/${department.department_id}/`)
        .then(res => setParentOptions(
          res.data
            .filter(p => p.position_id !== position.position_id)
            .map(p => ({ value: p.position_id, label: p.position_name }))
        ))
        .catch(() => {});
    }
  }, [show, department, position, axiosInstance]);

  const handleUpdate = () => {
    if (!name.trim()) {
      setError(returnTitle('add_depart.position_name_required'));
      return;
    }
    setSubmitting(true);
    setLockUI(true);
    axiosInstance.put(`/job-positions/update/${position.position_id}/`, {
      position_name: name,
      position_description: description,
      parent: parent?.value || null,
      department: department?.department_id
    })
      .then(() => {
        setSuccess(returnTitle('add_depart.updated_successfully'));
        setTimeout(() => {
          onUpdated?.();
          onHide?.();
        }, 1500);
      })
      .catch(err => {
        const detail = err?.response?.data?.detail;
        if (detail === 'add_depart.duplicate_position_name') {
          setError(`❌ ${returnTitle(detail)}`);
        } else {
          setError(detail || '❌ Server error');
        }
        setSubmitting(false);
        setLockUI(false);
      });
  };

  useEffect(() => {
    if (!show) {
      setName('');
      setDescription('');
      setParent(null);
      setError('');
      setSuccess('');
      setSubmitting(false);
      setLockUI(false);
    }
  }, [show]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#1f2a38',
      color: 'white',
      borderColor: '#555',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1f2a38',
      color: 'white',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#345' : '#1f2a38',
      color: 'white',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#ccc',
    }),
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="custom-fin-modal">
      <Modal.Header closeButton style={{ backgroundColor: '#2a3b4d', color: 'white' }}>
        <Modal.Title>{returnTitle('add_depart.update_position')}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: '#2a3b4d', color: 'white' }}>
        {success && <Alert type="success" message={success} />}
        {error && <Alert type="danger" message={error} />}

        <Form.Group className="mb-3">
          <Form.Label>{returnTitle('add_depart.position_name')}</Form.Label>
          <Form.Control
            value={name}
            onChange={e => setName(e.target.value)}
            className="rounded"
            style={{ backgroundColor: '#1f2a38', color: 'white', borderColor: '#555' }}
            placeholder={returnTitle('add_depart.enter_position_name')}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{returnTitle('add_depart.position_description')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="rounded"
            style={{ backgroundColor: '#1f2a38', color: 'white', borderColor: '#555' }}
            placeholder={returnTitle('add_depart.enter_position_description')}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>{returnTitle('add_depart.parent_position')}</Form.Label>
          <Select
            value={parent}
            onChange={setParent}
            options={parentOptions}
            isClearable
            placeholder={returnTitle('add_depart.select_parent_position')}
            styles={customStyles}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#2a3b4d' }}>
        <Button variant="secondary" onClick={onHide} disabled={lockUI}>
          {returnTitle('app.cancel')}
        </Button>
        <Button variant="primary" onClick={handleUpdate} disabled={submitting || lockUI}>
          {submitting ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              {returnTitle('app.saving')}...
            </>
          ) : returnTitle('app.save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
