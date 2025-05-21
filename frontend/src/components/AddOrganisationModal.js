import React, { useState, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import Alert from './Alert';

export default function AddOrganisationModal({ show, onHide, onCreated }) {
  const [name, setName] = useState('');
  const [inn, setInn] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 🟡

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const handleSubmit = async () => {
    if (!name || !inn) {
      setError('❌ Please fill in both Name and INN.');
      return;
    }

    setIsSubmitting(true); // 🔒 Prevent duplicate submit
    setError('');
    try {
      const res = await axiosInstance.post('/partners/', {
        partner_name: name,
        partner_inn: inn,
      });

      setSuccess('✅ Organisation successfully added.');
      setTimeout(() => {
        onHide();
        onCreated?.(); // 🔄 refresh list
        setName('');
        setInn('');
        setError('');
        setSuccess('');
        setIsSubmitting(false); // 🔓
      }, 1500);
    } catch (err) {
      setError(`❌ ${err}`);
      setIsSubmitting(false); // 🔓 on error too
    }
  };

  return (
    <>
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="info" message={success} />}
      <Modal
        show={show}
        onHide={onHide}
        size="md"
        centered
        backdrop="static"
        dialogClassName="custom-fin-modal"
      >
        <Modal.Body className="p-4 text-light">
          <h5 className="text-light mb-4">➕ Add New Organisation</h5>

          <Form.Group className="mb-3">
            <Form.Label>Organisation Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              placeholder="e.g. UZBEKENERGO LTD"
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>INN</Form.Label>
            <Form.Control
              type="text"
              value={inn}
              placeholder="e.g. 123456789"
              onChange={(e) => setInn(e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button variant="outline-light" onClick={onHide} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
