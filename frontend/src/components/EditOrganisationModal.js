import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import Alert from './Alert';
import DraggableModalDialog from './DraggableModalDialog';

export default function EditOrganisationModal({ show, onHide, organisation, onUpdated }) {
  const { returnTitle } = useI18n();
  const [name, setName] = useState('');
  const [inn, setInn] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [
    navigate, setUser, setAccessToken
  ]);

  useEffect(() => {
    if (organisation) {
      setName(organisation.partner_name);
      setInn(organisation.partner_inn);
    }
  }, [organisation]);

  const handleSubmit = async () => {
    if (!name || !inn) {
      setError('❌ Please fill in both Name and INN.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await axiosInstance.put(`/partners/${organisation.partner_code}/update/`, {
        partner_name: name,
        partner_inn: inn
      });

      setSuccess('✅ Organisation successfully updated.');
      setTimeout(() => {
        onUpdated?.();
        onHide();
        setSuccess('');
        setError('');
        setIsSubmitting(false);
      }, 1500);
    } catch (err) {
      setError('❌ Failed to update organisation');
      setIsSubmitting(false);
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
        <Modal.Body className="p-4 text-light" dialogAs={DraggableModalDialog}>
          <h5 className="text-light mb-4">{returnTitle('add_part.update_organisation')}</h5>

          <Form.Group className="mb-3">
            <Form.Label>{returnTitle('add_part.organisation_name')}</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>{returnTitle('add_part.inn')}</Form.Label>
            <Form.Control
              type="text"
              value={inn}
              onChange={(e) => setInn(e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button variant="outline-light" onClick={onHide} disabled={isSubmitting}>
              {returnTitle('app.cancel')}
            </Button>
            <Button variant="success" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? returnTitle('app.updating') + '...' : returnTitle('app.update')}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
