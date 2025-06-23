import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import './FinancialPartsModal.css';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';
import { useI18n } from '../context/I18nProvider';

export default function UpdateFinancialPartsModal({ show, onHide, project, onUpdated }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  const [parts, setParts] = useState([]);
  const [warning, setWarning] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [submitting, setSubmitting] = useState(false);




  useEffect(() => {
    if (show) {
      setSuccessMessage('');
      setShowSuccessAlert(false);
      setWarning('');
    }
  }, [show]); // ✅ Clears all alerts and messages when modal opens


  const sanitizePrice = (value) => Number(String(value || '').replace(/\D/g, ''));

  useEffect(() => {
    if (show && project?.project_code) {
      setSubmitting(false);
      axiosInstance
        .get(`/projects-financial-parts/${project.project_code}/`)
        .then((res) => setParts(res.data))
        .catch((err) => {
          console.error('❌ Failed to fetch parts:', err);
          setWarning(returnTitle('create_fpart.load_error'));
        });
    }
  }, [show, project?.project_code, axiosInstance]);

  const handleChange = (index, field, value) => {
    const updated = [...parts];
    setWarning('');

    if (field === 'fs_part_price') {
      const numericValue = value.replace(/\D/g, '');
      const totalAllocated = updated.reduce((sum, p, i) => sum + (i === index ? Number(numericValue) : sanitizePrice(p.fs_part_price)), 0);
      const max = Number(project?.total_price || 0);
      if (totalAllocated > max) {
        setWarning(`${returnTitle('create_fpart.exceeds_total_by')} ${(totalAllocated - max).toLocaleString()} so'm`);
      }
      updated[index][field] = Number(numericValue).toLocaleString();
    } else {
      updated[index][field] = value;
    }

    setParts(updated);
  };

  const handleRemovePart = (index) => {
    const updated = [...parts];
    updated.splice(index, 1);
    setParts(updated);
  };

  const handleAddPart = () => {
    setParts([...parts, { fs_part_name: '', fs_part_price: '', fs_start_date: '', fs_finish_date: '' }]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setWarning('');
    setSuccessMessage('');

    const totalAllocated = parts.reduce((sum, p) => sum + sanitizePrice(p.fs_part_price), 0);
    const maxAvailable = Number(project?.total_price || 0);
    const remaining = maxAvailable - totalAllocated;

    if (remaining < 0) {
      setWarning(`${returnTitle('create_fpart.exceeds_total_by')} ${Math.abs(remaining).toLocaleString()} so'm`);
      setSubmitting(false);
      return;
    }

    for (const part of parts) {
      const start = new Date(part.fs_start_date);
      const end = new Date(part.fs_finish_date);
      const projStart = new Date(project?.start_date);
      const projEnd = new Date(project?.end_date);

      if (start < projStart || end > projEnd || end < start) {
        setWarning(`❌ ${returnTitle('create_fpart.invalid_dates')} (${part.fs_part_name || returnTitle('create_fpart.part')})`);
        setSubmitting(false);
        return;
      }
    }

    const payload = parts.map((p, i) => ({
      fs_part_code: p.fs_part_code,
      fs_part_no: `${i + 1}`,
      fs_part_name: p.fs_part_name,
      fs_part_price: sanitizePrice(p.fs_part_price),
      fs_start_date: p.fs_start_date,
      fs_finish_date: p.fs_finish_date,
    }));

    try {
      await axiosInstance.put(`/projects-financial-parts/${project.project_code}/update/`, payload);
      setSuccessMessage(returnTitle('create_fpart.updated_successfully'));
      setShowSuccessAlert(true);
      onHide();
    } catch (err) {
      console.error('❌ Failed to update:', err);
      setWarning(`❌ ${returnTitle('create_fpart.update_failed')}`);
    } 
    finally {
      setTimeout(() => {
        setSuccessMessage('');
        setWarning('');
        setShowSuccessAlert(false);
        setSubmitting(false);
        onUpdated?.();
      }, 500);
    }
  };

  const totalAllocated = parts.reduce((sum, p) => sum + sanitizePrice(p.fs_part_price), 0);
  const maxAvailable = Number(project?.total_price || 0);
  const remaining = maxAvailable - totalAllocated;

  return (
    <>
      {showSuccessAlert && <Alert message={successMessage} type="info" />}
      <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" dialogClassName="custom-fin-modal">
        <Modal.Body className="p-4 text-light" style={{ fontFamily: 'Exo2Variable' }}>
          <h3 className="text-warning mb-2">{returnTitle('create_fpart.update_parts')}</h3>
          <h5 className="text-info">{project?.project_name}</h5>
          <h6 className="text-secondary">{project?.start_date} → {project?.end_date}</h6>
          <div className="fs-5 mb-2 text-white">
            {returnTitle('create_fpart.remaining_budget')} : <span className='text-success'>{remaining.toLocaleString()} {returnTitle('create_proj.uzs')}</span> {returnTitle('create_fpart.total_budget')} : <span className='text-warning'>{maxAvailable.toLocaleString()} {returnTitle('create_proj.uzs')}</span>
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
            <div className="text-warning bg-opacity-10 border border-warning rounded px-3 py-2 mb-3">
              {warning}
            </div>
          )}

          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={onHide} className="px-4 rounded" disabled={submitting}>
              {returnTitle('app.cancel')}
            </Button>
            <Button variant="success" onClick={handleSubmit} className="px-4 rounded" disabled={submitting}>
              {submitting ? returnTitle('app.saving') : returnTitle('app.save_changes')}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
