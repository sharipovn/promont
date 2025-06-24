import React, { useState,useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import './FinancialPartsModal.css';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useI18n } from '../context/I18nProvider';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';







export default function FinancialPartsModal({ show, onHide, project, onCreated }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  const [parts, setParts] = useState([
    { fs_part_name: '', fs_part_price: '', fs_start_date: '', fs_finish_date: '' },
  ]);
  const [warning, setWarning] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [created, setCreated] = useState(false);


  useEffect(() => {
    if (show) {
      setSuccessMessage('');
      setShowSuccessAlert(false);
      setWarning('');
    }
  }, [show]); // ✅ Clears all alerts and messages when modal opens


  const handleAddPart = () => {
    setParts([...parts, { fs_part_name: '', fs_part_price: '', fs_start_date: '', fs_finish_date: '' }]);
  };

  const handleRemovePart = (index) => {
    const updated = [...parts];
    updated.splice(index, 1);
    setParts(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...parts];
    setWarning('');

    if (field === 'fs_part_price') {
      const numericValue = value.replace(/\D/g, '');
      updated[index][field] = Number(numericValue).toLocaleString();
    } else {
      updated[index][field] = value;
    }
    setParts(updated);
  };

  const handleSubmit = async () => {
    if (submitting) return; // ✅ Prevent double submission immediately
    setSubmitting(true);
    setWarning('');
    setSuccessMessage('');

    const totalAllocated = parts.reduce(
      (sum, p) => sum + Number((p.fs_part_price || '').replace(/\D/g, '') || 0),
      0
    );
    const maxAvailable = Number(project?.total_price || 0);
    const remaining = maxAvailable - totalAllocated;

    if (remaining < 0) {
      setWarning(`❌ ${returnTitle('create_fpart.exceeds_total_by')} ${Math.abs(remaining).toLocaleString()} ${returnTitle(`currency.${project?.currency_name?.toLowerCase()}`)?.toUpperCase()}`);
      setSubmitting(false);
      return;
    }

    for (const part of parts) {
      const start = new Date(part.fs_start_date);
      const end = new Date(part.fs_finish_date);
      const projStart = new Date(project?.start_date);
      const projEnd = new Date(project?.end_date);

      if (start < projStart || end > projEnd || end < start) {
        setWarning(
          `❌ ${returnTitle('create_fpart.invalid_dates')} (${part.fs_part_name || returnTitle('create_fpart.part')})`
        );
        setSubmitting(false);
        return;
      }
    }

    const payload = {
      project_code: project.project_code,
      parts: parts.map((p, idx) => ({
        fs_part_no: `${idx + 1}`,
        fs_part_name: p.fs_part_name,
        fs_part_price: Number(p.fs_part_price.replace(/\D/g, '')),
        fs_start_date: p.fs_start_date,
        fs_finish_date: p.fs_finish_date,
      })),
    };

    try {
      const res = await axiosInstance.post('/projects-financial-parts/create/', payload);
      setSuccessMessage('✅ Financial parts created successfully.');
      setCreated(true); // 🔒 Lock button after success
      setShowSuccessAlert(true);
      setTimeout(() => {
        setSuccessMessage('');
        setWarning('');
        setShowSuccessAlert(false);
        onHide();
        onCreated?.();
      }, 2000);
    } catch (err) {
        const d = err?.response?.data || {};
        const msg = d.key
          ? `${returnTitle(d.key)}`
          : Object.values(d).flat().join(', ') || returnTitle('create_fpart.creation_failed');
        setWarning(`❌ ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const totalAllocated = parts.reduce(
    (sum, p) => sum + Number((p.fs_part_price || '').replace(/\D/g, '') || 0),
    0
  );
  const maxAvailable = Number(project?.total_price || 0);
  const remaining = maxAvailable - totalAllocated;

  return (
    <>
      {showSuccessAlert && <Alert message={successMessage} type="info" />}
      <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" dialogClassName="custom-fin-modal">
        <Modal.Body className="p-4 text-light" style={{ fontFamily: 'Exo2Variable' }}>
          <h3 className="text-light mb-2">{returnTitle('create_fpart.create_financial_parts')}</h3>
          <h5 className="text-info">{project?.project_name}</h5>
          <h6 className="text-secondary">{project?.start_date} → {project?.end_date}</h6>
          <div className="fs-5 mb-2 text-white">
            {returnTitle('create_fpart.remaining_budget')} : <span className='text-success'>{remaining.toLocaleString()} {returnTitle(`currency.${project?.currency_name?.toLowerCase()}`)?.toUpperCase()}</span> {returnTitle('create_fpart.total_budget')} : <span className='text-warning'>{maxAvailable.toLocaleString()} {returnTitle(`currency.${project?.currency_name?.toLowerCase()}`)?.toUpperCase()}</span> 
          </div>

          {parts.map((part, index) => (
            <div key={index} className="border rounded p-3 mb-3" style={{ background: 'linear-gradient(to right, #334155, #1e293b)', borderColor: '#475569' }}>
              <Row className="align-items-end g-3">
                <Col md={2}>
                  <strong className="text-white">{returnTitle('create_fpart.f_part_no')} № : {index + 1}</strong>
                </Col>
                <Col md>
                  <Form.Label>{returnTitle('create_fpart.fs_part_name')}</Form.Label>
                  <Form.Control value={part.fs_part_name} onChange={(e) => handleChange(index, 'fs_part_name', e.target.value)} className="unified-input" />
                </Col>
                <Col md>
                  <Form.Label>{returnTitle('create_fpart.fs_part_price')}</Form.Label>
                  <Form.Control type="text" inputMode="numeric" value={part.fs_part_price} onChange={(e) => handleChange(index, 'fs_part_price', e.target.value)} className="unified-input" />
                </Col>
                <Col md>
                  <Form.Label>{returnTitle('create_fpart.fs_start_date')}</Form.Label>
                  <Form.Control type="date" value={part.fs_start_date} onChange={(e) => handleChange(index, 'fs_start_date', e.target.value)} className="unified-input" />
                </Col>
                <Col md>
                  <Form.Label>{returnTitle('create_fpart.fs_finish_date')}</Form.Label>
                  <Form.Control type="date" value={part.fs_finish_date} onChange={(e) => handleChange(index, 'fs_finish_date', e.target.value)} className="unified-input" />
                </Col>
                <Col md="auto">
                  <Button variant="outline-danger" onClick={() => handleRemovePart(index)}>
                    <FaTrash />
                  </Button>
                </Col>
              </Row>
            </div>
          ))}

          <Button variant="outline-info" onClick={handleAddPart} className="mb-3">
            <FaPlus /> {returnTitle('create_fpart.add_fs_part')}
          </Button>

          {warning && (
            <div className="bg-warning bg-opacity-10 text-warning border border-warning rounded px-3 py-2 mb-3" style={{ fontSize: '0.9rem' }}>
              {warning}
            </div>
          )}

          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={onHide} className="px-4 rounded" disabled={submitting}>
              {returnTitle('app.cancel')}
            </Button>
            <Button
            variant="success"
            className="px-4 rounded"
            onClick={handleSubmit}
            disabled={submitting || created}
          >
            {submitting
              ? returnTitle('app.creating')
              : returnTitle('app.create')}
          </Button>

          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
