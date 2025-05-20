import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import './FinancialPartsModal.css';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';

export default function UpdateFinancialPartsModal({ show, onHide, project, onUpdated }) {
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const [parts, setParts] = useState([]);
  const [warning, setWarning] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    if (show && project?.project_code) {
      axiosInstance
        .get(`/projects-financial-parts/${project.project_code}/`)
        .then((res) => setParts(res.data))
        .catch((err) => {
          console.error('❌ Failed to fetch parts:', err);
          setWarning('Failed to load financial parts.');
        });
    }
  }, [show, project?.project_code, axiosInstance]);

  const handleChange = (index, field, value) => {
    const updated = [...parts];
    setWarning('');

    if (field === 'fs_part_price') {
      const numericValue = String(value).replace(/\D/g, '');
      const totalAllocated = updated.reduce(
        (sum, p, i) =>
          sum + (i === index ? Number(numericValue) : Number(String(p.fs_part_price || '').replace(/\D/g, ''))),
        0
      );

      const max = Number(project?.total_price || 0);
      if (totalAllocated > max) {
        setWarning(`⚠️ Total exceeds by ${(totalAllocated - max).toLocaleString()} so'm`);
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
    setParts([
      ...parts,
      { fs_part_name: '', fs_part_price: '', fs_start_date: '', fs_finish_date: '' }
    ]);
  };

  const handleSubmit = async () => {
    try {
      const payload = parts.map((p, i) => ({
        fs_part_code: p.fs_part_code,
        fs_part_no: `Part ${i + 1}`,
        fs_part_name: p.fs_part_name,
        fs_part_price: Number(String(p.fs_part_price || '').replace(/\D/g, '')),
        fs_start_date: p.fs_start_date,
        fs_finish_date: p.fs_finish_date,
      }));

      await axiosInstance.put(`/projects-financial-parts/${project.project_code}/update/`, payload);
      setSuccessMessage('✅ Financial parts successfully updated.');
      setShowSuccessAlert(true);

      setTimeout(() => {
        setSuccessMessage('');
        setWarning('');
        setShowSuccessAlert(false);
        onHide();
        onUpdated?.();
      }, 2000);
    } catch (err) {
      console.error('❌ Failed to update:', err);
      setWarning(`❌ Error saving changes. Try again.\n${err}`);
      setTimeout(() => setWarning(''), 3000);
    }
  };

  return (
    <>
      {showSuccessAlert && <Alert message={successMessage} type="info" />}
      <Modal
        show={show}
        onHide={onHide}
        size="xl"
        centered
        backdrop="static"
        dialogClassName="custom-fin-modal"
      >
        <Modal.Body className="p-4 text-light" style={{ fontFamily: 'Consolas, monospace' }}>
          <h3 className="text-warning mb-2">Update Financial Parts</h3>
          <h5 className="text-info">{project?.project_name}</h5>
          <div className="fs-5 mb-4 text-white">{project?.total_price.toLocaleString()} so'm</div>

          {parts.map((part, index) => (
            <div
              key={index}
              className="border rounded p-3 mb-3"
              style={{ background: 'linear-gradient(to right, #334155, #1e293b)', borderColor: '#475569' }}
            >
              <Row className="align-items-end g-3">
                <Col md={2}>
                  <strong className="text-white">N: Part {index + 1}</strong>
                </Col>
                <Col md>
                  <Form.Label>Part Name</Form.Label>
                  <Form.Control
                    value={part.fs_part_name}
                    onChange={(e) => handleChange(index, 'fs_part_name', e.target.value)}
                    className="unified-input"
                  />
                </Col>
                <Col md>
                  <Form.Label>Expenditure</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    value={part.fs_part_price}
                    onChange={(e) => handleChange(index, 'fs_part_price', e.target.value)}
                    className="unified-input"
                  />
                </Col>
                <Col md>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={part.fs_start_date}
                    onChange={(e) => handleChange(index, 'fs_start_date', e.target.value)}
                    className="unified-input"
                  />
                </Col>
                <Col md>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={part.fs_finish_date}
                    onChange={(e) => handleChange(index, 'fs_finish_date', e.target.value)}
                    className="unified-input"
                  />
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
            <FaPlus /> Add Part
          </Button>

          {warning && (
            <div className="text-warning bg-opacity-10 border border-warning rounded px-3 py-2 mb-3">
              {warning}
            </div>
          )}

          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={onHide} className="px-4 rounded-pill">
              Cancel
            </Button>
            <Button variant="success" onClick={handleSubmit} className="px-4 rounded-pill">
              Save Changes
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
