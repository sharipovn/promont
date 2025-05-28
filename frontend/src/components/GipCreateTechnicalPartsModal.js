import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import Select from 'react-select';
import './FinancialPartsModal.css';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';

export default function GipCreateTechnicalPartsModal({ show, onHide, financialPart = {}, project = {}, onCreated }) {
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  const [parts, setParts] = useState([{ tch_part_name: '', tch_part_nach: null, tch_start_date: '', tch_finish_date: '', error: '' }]);
  const [nachOptions, setNachOptions] = useState([]);
  const [loadingNach, setLoadingNach] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    axiosInstance.get('/users-with-capability/', { params: { capability: 'CAN_CREATE_WORK_ORDER' } })
      .then((res) => {
        const options = res.data.map((user) => ({ label: user.fio, value: user.user_id }));
        setNachOptions(options);
      })
      .catch((err) => console.error('❌ Failed to load users with capability:', err))
      .finally(() => setLoadingNach(false));
  }, [axiosInstance]);

  useEffect(() => {
    if (financialPart?.existing_tech_parts?.length) {
      setIsUpdate(true);
      setParts(financialPart.existing_tech_parts.map(p => ({
        tch_part_name: p.tch_part_name || '',
        tch_part_nach: nachOptions.find(n => n.value === p.tch_part_nach) || null,
        tch_start_date: p.tch_start_date || '',
        tch_finish_date: p.tch_finish_date || '',
        error: ''
      })));
    } else {
      setIsUpdate(false);
      setParts([{ tch_part_name: '', tch_part_nach: null, tch_start_date: '', tch_finish_date: '', error: '' }]);
    }
  }, [financialPart, nachOptions]);

  const handleAddPart = () => {
    setParts([...parts, { tch_part_name: '', tch_part_nach: null, tch_start_date: '', tch_finish_date: '', error: '' }]);
  };

  const handleRemovePart = (index) => {
    const updated = [...parts];
    updated.splice(index, 1);
    setParts(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...parts];
    updated[index][field] = value;
    updated[index].error = '';
    setParts(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const fsStart = new Date(financialPart.fs_start_date);
    const fsFinish = new Date(financialPart.fs_finish_date);

    const updatedParts = parts.map((p) => {
      let error = '';
      if (!p.tch_part_name || !p.tch_part_nach || !p.tch_start_date || !p.tch_finish_date) {
        error = '❌ All fields are required.';
      } else {
        const start = new Date(p.tch_start_date);
        const end = new Date(p.tch_finish_date);
        if (!p.tch_part_nach) {
          error = '❌ Assigned person is required.';
        } else if (start < fsStart || end > fsFinish || end < start) {
          error = '❌ Dates must be within the financial part range and end date must not be before start date.';
        }
      }
      return { ...p, error };
    });

    const hasError = updatedParts.some((p) => p.error);
    if (hasError) {
      setParts(updatedParts);
      setSubmitting(false);
      return;
    }

    const payload = {
      fs_part_code: financialPart.fs_part_code,
      parts: updatedParts.map((p, idx) => ({
        tch_part_no: `${idx + 1}`,
        tch_part_name: p.tch_part_name,
        tch_part_nach: p.tch_part_nach?.value || null,
        tch_start_date: p.tch_start_date,
        tch_finish_date: p.tch_finish_date,
      })),
    };

    try {
      const url = isUpdate ? '/gip-projects/update-technical-parts/' : '/gip-projects/create-technical-parts/';
      await axiosInstance.post(url, payload);
      setSuccessMessage(`✅ Technical parts ${isUpdate ? 'updated' : 'created'} successfully.`);
      setShowSuccessAlert(true);
      setTimeout(() => {
        setSuccessMessage('');
        setShowSuccessAlert(false);
        onHide();
        onCreated?.();
      }, 2000);
    } catch (err) {
      console.error(`❌ Error ${isUpdate ? 'updating' : 'creating'} tech parts:`, err);
    } finally {
      setSubmitting(false);
    }
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#1e293b',
      borderColor: '#475569',
      color: 'white',
      minHeight: '38px',
      height: '38px',
      boxShadow: 'none'
    }),
    valueContainer: (provided) => ({ ...provided, height: '38px', padding: '0 6px' }),
    indicatorsContainer: (provided) => ({ ...provided, height: '38px' }),
    input: (provided) => ({ ...provided, margin: '0px', padding: '0px' }),
    singleValue: (provided) => ({ ...provided, color: 'white', whiteSpace: 'normal', wordWrap: 'break-word' }),
    menu: (provided) => ({ ...provided, backgroundColor: '#1e293b', color: 'white', zIndex: 9999 }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isFocused ? '#334155' : '#1e293b', color: '#fff', cursor: 'pointer' })
  };

  return (
    <>
      {showSuccessAlert && <Alert message={successMessage} type="info" />}
      <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" dialogClassName="custom-fin-modal">
        <Modal.Body className="p-4 text-light">
          <h3 className="text-light mb-2">{isUpdate ? 'Update Technical Parts' : 'Create Technical Parts'}</h3>
          <h5 className="text-info">{project?.project_name}</h5>
          <div className="fs-6 mb-3 text-white">
            Financial Part: <strong>{financialPart?.fs_part_no}</strong> - {financialPart?.fs_part_name} ({financialPart?.fs_start_date} - {financialPart?.fs_finish_date})
          </div>

          {parts.map((part, index) => (
            <div key={index} className="border rounded p-3 mb-3 bg-dark bg-opacity-50">
              <Row className="align-items-end g-3">
                <Col md={2}><strong className="text-white">#{index + 1}</strong></Col>
                <Col md>
                  <Form.Label>Technical Part Name</Form.Label>
                  <Form.Control
                    value={part.tch_part_name}
                    onChange={(e) => handleChange(index, 'tch_part_name', e.target.value)}
                    className="unified-input"
                    required
                  />
                </Col>
                <Col md>
                  <Form.Label>Assigned Person (Nachalnik)</Form.Label>
                  <Select
                    isLoading={loadingNach}
                    value={part.tch_part_nach}
                    onChange={(value) => handleChange(index, 'tch_part_nach', value)}
                    options={nachOptions}
                    styles={customSelectStyles}
                    className="unified-input"
                    classNamePrefix="react-select"
                    menuPlacement="auto"
                  />
                </Col>
                <Col md>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={part.tch_start_date}
                    onChange={(e) => handleChange(index, 'tch_start_date', e.target.value)}
                    className="unified-input"
                    required
                  />
                </Col>
                <Col md>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={part.tch_finish_date}
                    onChange={(e) => handleChange(index, 'tch_finish_date', e.target.value)}
                    className="unified-input"
                    required
                  />
                </Col>
                <Col md="auto">
                  <Button variant="outline-danger" onClick={() => handleRemovePart(index)}>
                    <FaTrash />
                  </Button>
                </Col>
              </Row>
              {part.error && (
                <div className="text-danger small mt-2 px-2">{part.error}</div>
              )}
            </div>
          ))}

          <Button variant="outline-info" onClick={handleAddPart} className="mb-3">
            <FaPlus /> Add Technical Part
          </Button>

          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={onHide} className="px-4 rounded-pill">
              Cancel
            </Button>
            <Button
              variant="success"
              className="px-4 rounded-pill"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" /> {isUpdate ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isUpdate ? 'Update' : 'Create'
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
