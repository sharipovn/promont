import React, { useState, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthProvider';
import DraggableModalDialog from './DraggableModalDialog'
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { LuPlus } from "react-icons/lu";
import Alert from './Alert';
import { useI18n } from '../context/I18nProvider';



export default function AddOrganisationModal({ show, onHide, onCreated }) {

  const {  returnTitle } = useI18n(); // ✅ include returnTitle

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
        <Modal.Body className="p-4 text-light" dialogAs={DraggableModalDialog}>
          <h5 className="text-light mb-4"><LuPlus/> {returnTitle('add_part.add_organisation')}</h5>

          <Form.Group className="mb-3">
            <Form.Label>{returnTitle('add_part.organisation_name')}</Form.Label>
            <Form.Control
              type="text"
              value={name}
              placeholder={returnTitle('app.e.g.') + ' UZBEKENERGO LTD'}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>{returnTitle('add_part.inn')}</Form.Label>
            <Form.Control
              type="text"
              value={inn}
              placeholder= {returnTitle('app.e.g.') + ' 123456789'}
              onChange={(e) => setInn(e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button variant="outline-light" onClick={onHide} disabled={isSubmitting}>
              {returnTitle('app.cancel')}
            </Button>
            <Button variant="success" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? returnTitle('app.creating') + '...' : returnTitle('app.create')}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
