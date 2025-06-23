// ✅ Improved EditStaffModal with image shown live, fallback 'No Image', corrected label layout, and styled Select menu
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Spinner, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { useI18n } from '../context/I18nProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { FaInfoCircle } from 'react-icons/fa';
import Alert from './Alert';

export default function EditStaffModal({ show, onHide, staff, onUpdated }) {
  const { returnTitle } = useI18n();
  const [formData, setFormData] = useState({
    fio: '',
    position: '',
    position_start_date: '',
    department: null,
    birthday: '',
    address: '',
    pnfl: '',
    phone_number: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState('');
  const [formWarning, setFormWarning] = useState('');

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  useEffect(() => {
    if (show) {
      axiosInstance.get('/manage-staff/department-list/').then(res => {
        const options = res.data.map(d => ({
          value: d.department_id,
          label: d.department_name,
          positions: d.job_positions || []
        }));
        setDepartments(options);
      });
    }
  }, [axiosInstance, show]);

  useEffect(() => {
    if (staff) {
      setFormData({
        fio: staff.fio || '',
        position: staff.position ? { value: staff.position.position_id, label: staff.position.position_name }: null,
        position_start_date: staff.position_start_date || '',
        department: staff.department ? { value: staff.department.department_id, label: staff.department.department_name } : null,
        birthday: staff.birthday || '',
        address: staff.address || '',
        pnfl: staff.pnfl || '',
        phone_number: staff.phone_number || '',
      });
      setMessage('');
      setError('');
      setFormWarning('');
      setSubmitting(false);
      setLocked(false);
      setProfileImage(null);
    }
  }, [staff, show]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!formData.fio || !formData.phone_number) {
      setFormWarning(returnTitle('staff.fio_phone_required'));
      return;
    }
    if (profileImage && profileImage.size > 10 * 1024 * 1024) {
      setFormWarning(returnTitle('staff.image_too_large'));
      return;
    }

    const payload = new FormData();
    Object.entries({
      ...formData,
      department: formData.department?.value?.toString() ?? '',
      position: formData.position?.value?.toString() ?? '',
      position_start_date: formData.position_start_date || '',
      birthday: formData.birthday || '',
    }).forEach(([key, value]) => {
      payload.append(key, value);
    });
    if (profileImage) payload.append('profile_image', profileImage);

    setSubmitting(true);
    setError('');
    setFormWarning('');
    axiosInstance
      .patch(`/manage-staff/staff-users/${staff.user_id}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(() => {
        setMessage(returnTitle('staff.updated_successfully'));
        setLocked(true);
        onUpdated?.();
        setTimeout(() => onHide(), 1500);
      })
      .catch((err) => {
        console.error(err);
        setLocked(false);
        setError(returnTitle('staff.update_failed'));
      })
      .finally(() => setSubmitting(false));
  };

  const inputStyle = {
    backgroundColor: '#1f2a38',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    borderRadius: '8px'
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#1f2a38',
      borderColor: 'rgba(255,255,255,0.2)',
      color: 'white',
      borderRadius: '8px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#1f2a38',
      color: 'white',
    }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    placeholder: (base) => ({ ...base, color: '#ccc' }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#2c3e50' : '#1f2a38',
      color: 'white',
    }),
  };

  const selectedDept = departments.find(dep => dep.value === formData.department?.value);
  const availablePositions = selectedDept?.positions.map(p => ({ value: p.position_id, label: p.position_name })) || [];

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#2e3a4b', color: 'white' }}>
        <Modal.Title>{returnTitle('staff.edit_staff')}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: '#2e3a4b', color: 'white' }}>
        {error && <Alert type="danger" message={error} />}
        {message && <Alert type="danger" message={message} />}
        {formWarning && <div className="text-center text-danger mb-2">{formWarning}</div>}
        <Form encType="multipart/form-data">
          <Row>
            <Col md={4} className="text-center">
              <div style={{ width: '100%', height: '150px', borderRadius: '10px', border: '1px solid #ccc', overflow: 'hidden', marginBottom: '10px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                {(profileImage || staff.profile_image) ? (
                  <img
                    src={profileImage ? URL.createObjectURL(profileImage) : staff.profile_image}
                    alt={returnTitle('staff.staff_photo')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                  />
                ) : (
                  <div className="position-absolute top-0 w-100 h-100 d-flex align-items-center justify-content-center text-light">
                    {returnTitle('staff.no_image')}
                  </div>
                )}
              </div>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files[0])}
                disabled={locked}
                style={{ backgroundColor: '#1f2a38', color: 'white', borderRadius: '8px' }}
              />
              <div className="d-flex flex-column align-items-start text-start mt-3">
                <small className="text-info d-block">
                  <FaInfoCircle className="me-1" /> {returnTitle('staff.image_max_10mb')}
                </small>
                <small className="text-info d-block mt-2">
                  <FaInfoCircle className="me-1" /> {returnTitle('staff.only_images_allowed')}
                </small>
              </div>
            </Col>
            <Col md={8}>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>{returnTitle('staff.fio')} *</Form.Label>
                  <Form.Control style={inputStyle} name="fio" value={formData.fio} onChange={handleChange} disabled={locked} required />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>{returnTitle('staff.phone_number')} *</Form.Label>
                  <Form.Control style={inputStyle} name="phone_number" value={formData.phone_number} onChange={handleChange} disabled={locked} required />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>{returnTitle('staff.position')}</Form.Label>
                  <Select
                      isClearable
                      classNamePrefix="react-select"
                      placeholder={returnTitle('staff.select_position')}
                      className='text-light'
                      styles={selectStyles}
                      value={formData.position}
                      onChange={(opt) => setFormData({ ...formData, position: opt })}
                      options={availablePositions}
                      isDisabled={locked || availablePositions.length === 0}
                    />

                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>{returnTitle('staff.position_start_date')}</Form.Label>
                  <Form.Control style={inputStyle} type="date" name="position_start_date" value={formData.position_start_date} onChange={handleChange} disabled={locked} />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>{returnTitle('staff.birthday')}</Form.Label>
                  <Form.Control style={inputStyle} type="date" name="birthday" value={formData.birthday} onChange={handleChange} disabled={locked} />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>{returnTitle('staff.department')}</Form.Label>
                  <Select
                    isClearable
                    classNamePrefix="react-select"
                    placeholder={returnTitle('staff.select_department')}
                    className='text-light'
                    styles={selectStyles}
                    value={formData.department}
                    onChange={(opt) => setFormData({ ...formData, department: opt, position: '' })}
                    options={departments}
                    isDisabled={locked}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>{returnTitle('staff.address')}</Form.Label>
                  <Form.Control style={inputStyle} name="address" value={formData.address} onChange={handleChange} disabled={locked} />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>{returnTitle('staff.pnfl')}</Form.Label>
                  <Form.Control style={inputStyle} inputMode="numeric" pattern="[0-9]*" name="pnfl" value={formData.pnfl} onChange={(e) => setFormData({ ...formData, pnfl: e.target.value.replace(/\D/g, '') })} disabled={locked} />
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#2e3a4b' }}>
        <Button variant="secondary" onClick={onHide} disabled={locked}>{returnTitle('app.cancel')}</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={locked}>
          {submitting ? <><Spinner size="sm" animation="border" className="me-2" /> {returnTitle('app.updating')}</> : returnTitle('app.update')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
