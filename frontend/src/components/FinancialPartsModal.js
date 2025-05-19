import React, { useState,useMemo } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import './FinancialPartsModal.css';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';





export default function FinancialPartsModal({ show, onHide, project }) {

    const { setUser, setAccessToken } = useAuth();
    const navigate = useNavigate();

    const axiosInstance = useMemo(() => {
    return createAxiosInstance(navigate, setUser, setAccessToken);
    }, [navigate, setUser, setAccessToken]);



  const [parts, setParts] = useState([
    { fs_part_name: '', fs_part_price: '', fs_start_date: '', fs_finish_date: '' },
  ]);
  const [warning, setWarning] = useState('');

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

    // Clear error when user edits input
    setWarning(''); // ✅ This line ensures the button is re-enabled

    if (field === 'fs_part_price') {
        const numericValue = value.replace(/\D/g, '');

        const totalAllocated = updated.reduce((sum, p, i) =>
        sum + (i === index ? Number(numericValue) || 0 : Number((p.fs_part_price || '').replace(/\D/g, '') || 0)), 0
        );

        const maxAvailable = Number(project?.total_price || 0);
        if (totalAllocated > maxAvailable) {
        setWarning(`⚠️ Total exceeds by ${(totalAllocated - maxAvailable).toLocaleString()} so'm`);
        } else {
        setWarning('');
        }

        updated[index][field] = Number(numericValue).toLocaleString();
    } else {
        updated[index][field] = value;
    }

    setParts(updated);
    };


  const handleSubmit = async () => {
  const payload = {
    project_code: project.project_code,
    parts: parts.map((p, idx) => ({
      fs_part_no: `Part ${idx + 1}`,
      fs_part_name: p.fs_part_name,
      fs_part_price: Number(p.fs_part_price.replace(/\D/g, '')),
      fs_start_date: p.fs_start_date,
      fs_finish_date: p.fs_finish_date,
    }))
  };

  try {
    const res = await axiosInstance.post('/projects-financial-parts/create/', payload);
    console.log('✅ Created parts:', res.data);
    onHide();
  } catch (err) {
    console.error('❌ Error creating parts:', err);
    setWarning('❌ Failed to create parts. Please try again.');
  }
};


  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop="static"
      dialogClassName="custom-fin-modal"
    >
      <Modal.Body className="p-4 text-light" style={{ fontFamily: 'Consolas, monospace' }}>
        <h3 className="text-light mb-2">Create Financial Parts</h3>
        <h5 className="text-info">{project?.project_name}</h5>
        <div className="fs-5 mb-4 text-white">{project?.total_price.toLocaleString()} so'm</div>

        {parts.map((part, index) => (
          <div
            key={index}
            className="border rounded p-3 mb-3"
            style={{
              background: 'linear-gradient(to right, #334155, #1e293b)',
              borderColor: '#475569',
            }}
          >
            <Row className="align-items-end g-3">
              <Col md={2}>
                <strong className="text-white">N: Part {index + 1}</strong>
              </Col>
              <Col md>
                <Form.Label>Financial Part Name</Form.Label>
                <Form.Control
                  value={part.fs_part_name}
                  onChange={(e) => handleChange(index, 'fs_part_name', e.target.value)}
                  className="unified-input"
                />
              </Col>
              <Col md>
                <Form.Label>Allocated Expenditure</Form.Label>
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
          <div className="bg-warning bg-opacity-10 text-warning border border-warning rounded px-3 py-2 mb-3" style={{ fontSize: '0.9rem' }}>
            {warning}
          </div>
        )}

        <div className="d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={onHide} className="px-4 rounded-pill">
            Cancel
          </Button>
          <Button variant="success" className="px-4 rounded-pill" onClick={handleSubmit} disabled={!!warning}>
            Create and Send to Director
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
