import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import Alert from './Alert';

import { useI18n } from '../context/I18nProvider';


export default function EditTranslationModal({ show, onHide, translation, onUpdated }) {

const { returnTitle } = useI18n();


  const [en, setEn] = useState('');
  const [ru, setRu] = useState('');
  const [uz, setUz] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [
    navigate, setUser, setAccessToken
  ]);

  useEffect(() => {
    if (translation) {
      setEn(translation.en || '');
      setRu(translation.ru || '');
      setUz(translation.uz || '');
    }
  }, [translation]);

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      await axiosInstance.patch(`/manage-translations/${translation.translation_id}/update/`, {
        en, ru, uz
      });

      setSuccess('✅ Translation updated.');
      setTimeout(() => {
        onHide();
        onUpdated?.();
        setSuccess('');
        setError('');
        setIsSubmitting(false);
      }, 1200);
    } catch (err) {
      setError('❌ Failed to update translation.');
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
        <h5 className="text-info mb-4">{returnTitle('internalization.edit_translation')}: <span className="text-warning">{translation?.key}</span></h5>

        {error && <Alert type="danger" message={error} />}
        {success && <Alert type="info" message={success} />}

        <Form.Group className="mb-3">
          <Form.Label className="text-light">{returnTitle('internalization.english')}</Form.Label>
          <Form.Control
            type="text"
            className="bg-transparent border text-light"
            placeholder="e.g. Create"
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
            placeholder="e.g. Создать"
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
            placeholder="e.g. Yaratish"
            value={uz}
            onChange={(e) => setUz(e.target.value)}
            disabled={isSubmitting}
          />
        </Form.Group>

        <div className="d-flex justify-content-between">
          <Button variant="outline-light" onClick={onHide} disabled={isSubmitting}>
           {isSubmitting ? returnTitle('app.closing') + '...' : returnTitle('app.cancel')}
          </Button>
          <Button variant="success" onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                {returnTitle('app.updating') + '...'}
              </>
            ) : returnTitle('app.update')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
