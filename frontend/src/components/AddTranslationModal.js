import React, { useState, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import Alert from './Alert';
import { useI18n } from '../context/I18nProvider';

export default function AddTranslationModal({ show, onHide, onCreated }) {
  const { returnTitle } = useI18n();
  
  const [key, setKey] = useState('');
  const [en, setEn] = useState('');
  const [ru, setRu] = useState('');
  const [uz, setUz] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const handleSubmit = async () => {
    if (!key.trim()) {
      setError('Translation key is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await axiosInstance.post('/manage-translations/', { key, en, ru, uz });
      setSuccess('✅ Translation added.');
      setTimeout(() => {
        onHide();
        onCreated?.();
        setKey('');
        setEn('');
        setRu('');
        setUz('');
        setSuccess('');
        setIsSubmitting(false);
      }, 1200);
    } catch (err) {
      setError('❌ Failed to add translation.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="md"
      centered
      backdrop="static"
      dialogClassName="custom-fin-modal"
    >
      <Modal.Body className="p-4 text-light">
        <h5 className="text-info mb-4">+ {returnTitle('internalization.add_translations')}</h5>

        {error && <Alert type="danger" message={error} />}
        {success && <Alert type="info" message={success} />}

        <Form.Group className="mb-3">
          <Form.Label className="text-light">{returnTitle('internalization.translation_key')}</Form.Label>
          <Form.Control
            type="text"
            className="bg-transparent border text-light"
            placeholder="e.g. app.create_project"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={isSubmitting}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-light">{returnTitle('internalization.english')}</Form.Label>
          <Form.Control
            type="text"
            className="bg-transparent border text-light"
            placeholder="e.g. Create project"
            value={en}
            onChange={(e) => setEn(e.target.value)}
            disabled={isSubmitting}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-light">{returnTitle('internalization.russian')}</Form.Label>
          <Form.Control
            type="text"
            className="bg-transparent border text-light"
            placeholder="e.g. Создать проект"
            value={ru}
            onChange={(e) => setRu(e.target.value)}
            disabled={isSubmitting}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="text-light">{returnTitle('internalization.uzbek')}</Form.Label>
          <Form.Control
            type="text"
            className="bg-transparent border text-light"
            placeholder="e.g. Loyihani yaratish"
            value={uz}
            onChange={(e) => setUz(e.target.value)}
            disabled={isSubmitting}
          />
        </Form.Group>


        <div className="d-flex justify-content-between">
          <Button variant="outline-light" onClick={onHide} disabled={isSubmitting}>
            {isSubmitting ? returnTitle('app.closing') + '...' : returnTitle('app.cancel')}
          </Button>
          <Button variant="success" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                {returnTitle('app.creating') + '...'}
              </>
            ) : returnTitle('app.create')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
