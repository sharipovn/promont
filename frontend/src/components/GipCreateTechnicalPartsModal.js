import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import Select from 'react-select';
import './FinancialPartsModal.css';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';
import { useI18n } from '../context/I18nProvider';





export default function GipCreateTechnicalPartsModal({ show, onHide, financialPart = {}, project = {}, onCreated,onUpdated }) {
  const { setUser, setAccessToken } = useAuth();
    const { returnTitle } = useI18n();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);
  const [created, setCreated] = useState(false);


  const [parts, setParts] = useState([{ tch_part_code: null, tch_part_no: '', tch_part_name: '', tch_part_nach: null, tch_start_date: '', tch_finish_date: '', error: '' }]);
  const [nachOptions, setNachOptions] = useState([]);
  const [loadingNach, setLoadingNach] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);


    // [4] Reset when modal shows
    useEffect(() => {
      if (show) {
        setCreated(false);
        setSuccessMessage('');
        setShowSuccessAlert(false);
      }
    }, [show]);



  useEffect(() => {
    axiosInstance.get('/users-with-capability/', { params: { capability: 'CAN_CREATE_WORK_ORDER' } })
      .then((res) => {
        const options = res.data.map((user) => ({
            value: user.user_id,
            label: (
              <div>
                {user.fio}
                {user.position && ` (${user.position})`}
                {user.reason && (
                  <div  className='text-success' style={{ fontSize: '0.85em'}}>{user.reason}</div>
                )}
              </div>
            ),
            not_selectable: user.not_selectable,
          }));
        setNachOptions(options);
      })
      .catch((err) => console.error('❌ Failed to load users with capability:', err))
      .finally(() => setLoadingNach(false));
  }, [axiosInstance]);

  useEffect(() => {
    if (financialPart?.existing_tech_parts?.length) {
      setIsUpdate(true);
      setParts(financialPart.existing_tech_parts.map(p => ({
        tch_part_code: p.tch_part_code || null,
        tch_part_no: p.tch_part_no || '',
        tch_part_name: p.tch_part_name || '',
        tch_part_nach: nachOptions.find(n => n.value === p.tch_part_nach) || null,
        tch_start_date: p.tch_start_date || '',
        tch_finish_date: p.tch_finish_date || '',
        error: ''
      })));
    } else {
      setIsUpdate(false);
      setParts([{ tch_part_code: null, tch_part_no: '', tch_part_name: '', tch_part_nach: null, tch_start_date: '', tch_finish_date: '', error: '' }]);
    }
  }, [financialPart, nachOptions]);

  const handleAddPart = () => {
    setParts([...parts, { tch_part_code: null, tch_part_no: '', tch_part_name: '', tch_part_nach: null, tch_start_date: '', tch_finish_date: '', error: '' }]);
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
        if (submitting) return;
        setSubmitting(true);

        setSuccessMessage('');
        setShowSuccessAlert(false);
    const fsStart = new Date(financialPart.fs_start_date);
    const fsFinish = new Date(financialPart.fs_finish_date);

    const updatedParts = parts.map((p) => {
      let error = '';
      if (!p.tch_part_name || !p.tch_part_nach || !p.tch_start_date || !p.tch_finish_date || !p.tch_part_no) {
        error = `❌ ${returnTitle('gip_form.all_fields_required')}`;
      } else {
        const start = new Date(p.tch_start_date);
        const end = new Date(p.tch_finish_date);
        if (!p.tch_part_nach) {
          error = `❌ ${returnTitle('gip_form.department_head_is_required')}`;
        } else if (start < fsStart || end > fsFinish || end < start) {
          error = '❌ ' + returnTitle('gip_form.invalid_dates');
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
      parts: updatedParts.map((p) => ({
        tch_part_code: p.tch_part_code, // important for update
        tch_part_no: p.tch_part_no,
        tch_part_name: p.tch_part_name,
        tch_part_nach: p.tch_part_nach?.value || null,
        tch_start_date: p.tch_start_date,
        tch_finish_date: p.tch_finish_date,
      })),
    };

    try {
      const url = isUpdate ? '/gip-projects/update-technical-parts/' : '/gip-projects/create-technical-parts/';
      await axiosInstance.post(url, payload);
      setSuccessMessage(`✅ ${returnTitle(isUpdate ? 'gip_form.parts_successfully_updated' : 'gip_form.parts_successfully_created')}`);
      // [2] On success
      setCreated(true);
      setShowSuccessAlert(true);

        // Wait for 2 full seconds (disable submit during this)
      setTimeout(() => {
        onHide();
        onCreated?.();   // ✅ Yangi tex qismlar yaratilganda
        onUpdated?.();   // ✅ Tex qismlar yangilanganda yoki umumiy holatda ham
        setSuccessMessage('');
        setShowSuccessAlert(false);
        setSubmitting(false);         // ✅ re-enable UI
      }, 500);

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
          <h3 className="text-light mb-2">
            {returnTitle(isUpdate ? 'gip_form.update_technical_parts' : 'gip_form.create_technical_parts')}
          </h3>
          <h5 className="text-info">{project?.project_name}</h5>
          <div className="fs-6 mb-3 text-white">
            Financial Part: <strong>{financialPart?.fs_part_no}</strong> - {financialPart?.fs_part_name} ({financialPart?.fs_start_date} - {financialPart?.fs_finish_date})
          </div>

          {parts.map((part, index) => (
            <div key={index} className="border rounded p-3 mb-3 bg-dark bg-opacity-50">
              <Row className="align-items-end g-3">
                <Col md={1}><strong className="text-white">#{index + 1}</strong></Col>
                <Col md={1}>
                  <Form.Label>{returnTitle('gip_form.part_no')}</Form.Label>
                  <Form.Control
                    value={part.tch_part_no}
                    onChange={(e) => handleChange(index, 'tch_part_no', e.target.value)}
                    className="unified-input"
                    required
                  />
                </Col>
                <Col md={5}>
                  <Form.Label>{returnTitle('gip_form.technical_part_name')}</Form.Label>
                  <Form.Control
                    value={part.tch_part_name}
                    onChange={(e) => handleChange(index, 'tch_part_name', e.target.value)}
                    className="unified-input"
                    required
                  />
                </Col>
                <Col md={2}>
                  <Form.Label>{returnTitle('gip_form.start_date')}</Form.Label>
                  <Form.Control
                    type="date"
                    value={part.tch_start_date}
                    onChange={(e) => handleChange(index, 'tch_start_date', e.target.value)}
                    className="unified-input"
                    required
                  />
                </Col>
                <Col md={2}>
                  <Form.Label>{returnTitle('gip_form.end_date')}</Form.Label>
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
              <Row  className="align-items-end g-3">
                <Col md={1}></Col>
                <Col md={5}>
                  <Form.Label>{returnTitle('gip_form.department_head')}</Form.Label>
                  <Select
                    isLoading={loadingNach}
                    value={part.tch_part_nach}
                    onChange={(value) => handleChange(index, 'tch_part_nach', value)}
                    options={nachOptions}
                    styles={customSelectStyles}
                    className="unified-input"
                    classNamePrefix="react-select"
                    menuPlacement="auto"
                    isOptionDisabled={(option) => option.not_selectable}
                  />
                </Col>
              </Row>
              {part.error && (
                <div className="text-danger small mt-2 px-2">{part.error}</div>
              )}
            </div>
          ))}

          <Button variant="outline-info" onClick={handleAddPart} className="mb-3">
            <FaPlus /> {returnTitle('gip_form.add_technical_part')}
          </Button>

          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={onHide} className="px-4 rounded">
              {returnTitle('app.cancel')}
            </Button>
            <Button
              variant="success"
              className="px-4 rounded"
              onClick={handleSubmit}
              disabled={submitting || created}
            >
               {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isUpdate
                      ? returnTitle('gip_form.updating')
                      : returnTitle('gip_form.creating')}
                  </>
                ) : isUpdate
                  ? returnTitle('gip_form.update')
                  : returnTitle('gip_form.create')}
            </Button>

          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
