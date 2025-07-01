// AdminUpdateUserModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import { useI18n } from '../context/I18nProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import Alert from './Alert';

export default function AdminUpdateUserModal({ show, onHide, onUpdated, user }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const [form, setForm] = useState({
    username: '',
    fio: '',
    phone_number: '',
    role: null
  });
  const [roleOptions, setRoleOptions] = useState([]);
  const [alertMsg, setAlertMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (show && user) {
      setAlertMsg('');
      setLocked(false);
      setForm({
        username: user.username || '',
        fio: user.fio || '',
        phone_number: user.phone_number || '',
        role: user.role_id ? { value: user.role_id, label: user.role_name } : null
      });

      axiosInstance.get('admin-users/roles').then(res => {
        const options = res.data.map(r => ({
          value: r.role_id,
          label: r.role_name
        }));
        setRoleOptions(options);
      }).catch(() => {
        setAlertMsg('❌ ' + returnTitle('create_user.role_fetch_failed'));
      });
    }
  }, [show, user, axiosInstance, returnTitle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const { fio, phone_number, role } = form;

    if ( !fio || !phone_number) {
      setAlertMsg('❌ ' + returnTitle('create_user.fio_and_phone_number_required'));
      return;
    }

    const payload = {
      fio,
      phone_number,
      role_id: role?.value
    };

    setSubmitting(true);
    try {
      await axiosInstance.put(`/admin-users/update/${user.user_id}/`, payload);
      setAlertMsg(returnTitle('create_user.updated_successfully'));
      setLocked(true);
      setTimeout(() => {
        onHide();
        setSubmitting(false);
        setAlertMsg('');
        onUpdated?.();
      }, 1200);
    } catch (err) {
      console.error(err);
      setAlertMsg('❌ ' + (err.response?.data?.detail || returnTitle('create_user.update_failed')));
      setSubmitting(false);
    }
  };

  const customSelectStyles = {
    control: (base) => ({ ...base, backgroundColor: 'transparent', borderColor: '#ced4da', color: '#fff' }),
    singleValue: (base) => ({ ...base, color: '#fff' }),
    input: (base) => ({ ...base, color: '#fff' }),
    placeholder: (base) => ({ ...base, color: '#bbb' }),
    menu: (base) => ({ ...base, backgroundColor: '#2c2f3a', color: '#fff' }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#3a3f51' : 'transparent', color: '#fff' })
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static" dialogClassName="custom-fin-modal">
      <Modal.Body className="p-4 text-light">
        <h5 className="text-info mb-4">{returnTitle('create_user.edit_title')}</h5>

        {alertMsg && <Alert type="info" message={alertMsg} />}

        <Form>
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label className="text-light">{returnTitle('create_user.username')}</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={form.username}
                readOnly
                style={{ cursor: 'not-allowed' }}
                className="bg-transparent border text-light"
              />
            </div>

            <div className="col-md-6 mb-3">
              <Form.Label className="text-light">{returnTitle('create_user.fio')}</Form.Label>
              <Form.Control
                type="text"
                name="fio"
                value={form.fio}
                onChange={handleChange}
                className="bg-transparent border text-light"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label className="text-light">{returnTitle('create_user.phone')}</Form.Label>
              <Form.Control
                type="text"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                className="bg-transparent border text-light"
              />
            </div>

            <div className="col-md-6 mb-3">
              <Form.Label className="text-light">{returnTitle('create_user.role')}</Form.Label>
              <Select
                options={roleOptions}
                value={form.role}
                onChange={(selected) => setForm({ ...form, role: selected })}
                styles={customSelectStyles}
                classNamePrefix="react-select"
                isClearable
              />
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <Button variant="outline-light" onClick={onHide} disabled={submitting}>
              {returnTitle('app.cancel')}
            </Button>
            <Button variant="success" onClick={handleSubmit} disabled={submitting || locked}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  {returnTitle('app.updating') + '...'}
                </>
              ) : returnTitle('app.update')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
