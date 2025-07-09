// CreateNewUserModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import { useI18n } from '../context/I18nProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import Alert from './Alert';

export default function CreateNewUserModal({ show, onHide, onCreated }) {
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
    role: null,
    password1: '',
    password2: ''
  });
  const [roleOptions, setRoleOptions] = useState([]);
  const [alertMsg, setAlertMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (show) {
      setAlertMsg('');
      setLocked(false);
      setForm({
        username: '',
        fio: '',
        phone_number: '',
        role: null,
        password1: '',
        password2: ''
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
  }, [show, axiosInstance, returnTitle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const { username, fio, phone_number, role, password1, password2 } = form;

    if (!username || !fio || !phone_number || !password1 || !password2 ) {
      setAlertMsg('❌ ' + returnTitle('create_user.all_fields_required'));
      return;
    }
    if (password1 !== password2) {
      setAlertMsg('❌ ' + returnTitle('create_user.passwords_mismatch'));
      return;
    }
    if (password1.length < 8) {
      setAlertMsg('❌ ' + returnTitle('create_user.password_too_short'));
      return;
    }
    if (!/[A-Z]/.test(password1)) {
      setAlertMsg('❌ ' + returnTitle('create_user.password_uppercase_required'));
      return;
    }
    if (!/[a-z]/.test(password1)) {
      setAlertMsg('❌ ' + returnTitle('create_user.password_lowercase_required'));
      return;
    }
    if (!/\d/.test(password1)) {
      setAlertMsg('❌ ' + returnTitle('create_user.password_number_required'));
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password1)) {
      setAlertMsg('❌ ' + returnTitle('create_user.password_symbol_required'));
      return;
    }

    const payload = {
      username,
      fio,
      phone_number,
      role_id: role?.value,
      password: password1,
    };

    setSubmitting(true);
    try {
      await axiosInstance.post('/admin-users/create/', payload);
      setAlertMsg(returnTitle('create_user.created_successfully'));
      setLocked(true);
      onCreated?.();
      setTimeout(() => {
        onHide();
        setSubmitting(false);
        setAlertMsg('');
      }, 1200);
    } catch (err) {
      console.error(err);
      setAlertMsg('❌ ' + (err.response?.data?.detail || returnTitle('create_user.creation_failed')));
      setSubmitting(false);
    }
  };

  const customSelectStyles = {
    control: (base) => ({ ...base, backgroundColor: 'transparent', borderColor: '#ced4da', color: '#fff' }),
    singleValue: (base) => ({ ...base, color: '#fff' }),
    input: (base) => ({ ...base, color: '#fff' }),
    placeholder: (base) => ({ ...base, color: '#bbb' }),
    menu: (base) => ({ ...base, backgroundColor: '#2c2f3a', color: '#fff' }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#3a3f51' : 'transparent', color: '#fff' }),
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static" dialogClassName="custom-fin-modal">
      <Modal.Body className="p-4 text-light">
        <h5 className="text-info mb-4">{returnTitle('create_user.title')}</h5>

        {alertMsg && <Alert type="info" message={alertMsg} />}

        <Form>
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label className="text-light">{returnTitle('create_user.username')}</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="bg-transparent border text-light"
              />
              <small className="text-warning">{returnTitle('create_user.username_unique')}</small>
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

          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label className="text-light">{returnTitle('create_user.password')}</Form.Label>
              <Form.Control
                type="password"
                name="password1"
                value={form.password1}
                onChange={handleChange}
                className="bg-transparent border text-light"
              />
            </div>

            <div className="col-md-6 mb-3">
              <Form.Label className="text-light">{returnTitle('create_user.confirm_password')}</Form.Label>
              <Form.Control
                type="password"
                name="password2"
                value={form.password2}
                onChange={handleChange}
                className="bg-transparent border text-light"
              />
            </div>
          </div>
          <div className="row">
            <ul className="text-warning small mt-1 mb-2 p-3  w-100">
                    <ul className="text-warning small mt-1 mb-0 ps-3 w-100">
                    <li><strong>{returnTitle('create_user.password')}:</strong> {returnTitle('create_user.password_rule_upper_lower')}</li>
                    <li><strong>{returnTitle('create_user.password')}:</strong> {returnTitle('create_user.password_rule_number')}</li>
                    <li><strong>{returnTitle('create_user.password')}:</strong> {returnTitle('create_user.password_rule_symbol')}</li>
                    <li><strong>{returnTitle('create_user.password')}:</strong> {returnTitle('create_user.password_rule_length')}</li>
                    </ul>
                </ul>
        </div>
          <div className="d-flex justify-content-between">
            <Button variant="outline-light" onClick={onHide} disabled={submitting}>
              {returnTitle('app.cancel')}
            </Button>
            <Button variant="success" onClick={handleSubmit} disabled={submitting || locked}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  {returnTitle('app.creating') + '...'}
                </>
              ) : returnTitle('app.confirm')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
