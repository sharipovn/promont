// UpdateProjectModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import { MdCreateNewFolder } from "react-icons/md";

import { useI18n } from '../context/I18nProvider';
import { withValidation } from '../utils/withValidation';
import Alert from './Alert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';

export default function UpdateProjectModal({ show, onHide, project, onUpdated }) {
  const { returnTitle } = useI18n();
  const [form, setForm] = useState({
    project_name: '',
    total_price: '',
    contract_number: '',
    start_date: '',
    end_date: '',
    financier: null,
    partner: null,
    currency: null, // ✅ new
  });

  const [financierOptions, setFinancierOptions] = useState([]);
  const [partnerOptions, setPartnerOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');;
  useEffect(() => {
  if (show) setAlertMsg('');
  }, [show]); // ✅ Clears message on open

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  console.log('project:',project)

  useEffect(() => {
    if (show && project) {
      setForm({
        project_name: project.project_name || '',
        total_price: project.total_price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') || '',
        contract_number: project.contract_number || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        financier: project.financier
          ? { value: project.financier, label: project.financier_fio }
          : null,
        partner: project.partner
          ? { value: project.partner, label: `${project.partner_name} (${project.partner_inn})` }
          : null,
        currency: project.currency
          ? { value: project.currency, label: project.currency_name  }
          : null,
      });


      axiosInstance.get('/users-with-capability/?capability=CAN_CONFIRM_PROJECT_FINANCIER')
        .then((res) => {
          const options = res.data.map((user) => ({
            value: user.user_id,
            label: `${user.fio} (${user.position || '---'})`,
          }));
          setFinancierOptions(options);
          setAlertMsg(''); // ✅ Clear alert if success
        }).catch((err) => {
          setAlertMsg('❌ ' + returnTitle('create_proj.financier_list_fetch_failed')); // Or custom message
        });


      axiosInstance.get('/currencies/').then((res) => {
        const options = res.data.map((c) => ({
          value: c.currency_id,
          label: c.currency_name,
        }));
        setCurrencyOptions(options);
        setAlertMsg(''); // ✅ Clear alert if success
      }).catch((err) => {
          setAlertMsg('❌ ' + returnTitle('create_proj.currency_list_fetch_failed')); // Or custom message
        });


      axiosInstance.get('/partners/')
        .then((res) => {
          const options = res.data.results.map((p) => ({
            value: p.partner_code,
            label: `${p.partner_name} (${p.partner_inn})`,
          }));
          setPartnerOptions(options);
          setAlertMsg(''); // ✅ Clear alert if success
        }).catch((err) => {
          setAlertMsg('❌ ' + returnTitle('create_proj.partner_list_fetch_failed')); // Or custom message
        });

    }
  }, [show, project, axiosInstance]);

  const formatNumber = (value) =>
    value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'total_price') {
      const formatted = formatNumber(value);
      setForm({ ...form, [name]: formatted });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    const { project_name, total_price, start_date, end_date, financier, partner,currency,contract_number } = form;

    if (!project_name || !total_price || !start_date || !end_date || !financier || !partner || !currency ||!contract_number) {
      setAlertMsg(returnTitle('create_proj.all_fields_required'));
      return;
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start >= end) {
      setAlertMsg(returnTitle('create_proj.start_date_less_than_end_date'));
      return;
    }

    if (end < today) {
      setAlertMsg(returnTitle('create_proj.end_date_must_be_greater_than_today'));
      return;
    }

    const payload = {
      ...form,
      total_price: parseInt(form.total_price.replace(/\s/g, ''), 10),
      financier: form.financier.value,
      partner: form.partner.value,
      currency: form.currency?.value,
    };

    setSubmitting(true);
    setAlertMsg('');
    try {
      await axiosInstance.put(`/project-list-create/${project.project_code}/`, payload);
      setAlertMsg(returnTitle('app.updated_successfully'));
      onUpdated?.();
      setTimeout(() => {
        onHide();
        setAlertMsg('');
        setSubmitting(false);
      }, 1200);
    } catch (err) {
        const d = err?.response?.data;
        const key =
          d?.detail?.key ||          // optional structured error
          d?.detail ||               // generic DRF exception
          Object.values(d || {})[0]?.[0] || // first validation error message (e.g., project_name[0])
          'create_proj.update_project_failed';

        setAlertMsg('❌ ' + returnTitle(key));
        setSubmitting(false);
      }
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: 'transparent',
      borderColor: '#ced4da',
      color: '#fff',
      minHeight: '38px',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#fff',
    }),
    input: (base) => ({
      ...base,
      color: '#fff',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#bbb',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#2c2f3a',
      color: '#fff',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#3a3f51' : 'transparent',
      color: '#fff',
      cursor: 'pointer',
    }),
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static" dialogClassName="custom-fin-modal">
      <Modal.Body className="p-4 text-light">
        <h5 className="text-warning mb-4">
          <MdCreateNewFolder className="me-2" />
          {returnTitle('create_proj.update_project')}
        </h5>

        {alertMsg && <Alert type="info" message={alertMsg} />}

        <Form>
          <div className="row">
          <Form.Group className="mb-3">
            <Form.Label className="text-light">{returnTitle('create_proj.project_name')}</Form.Label>
            <Form.Control
              type="text"
              name="project_name"
              className="bg-transparent border text-light"
              value={form.project_name}
              onChange={handleChange}
              placeholder={returnTitle('app.e.g.') + ' Energiya Monitoringi'}
              required
            />
          </Form.Group>
          </div>
          <div className="row">
          <Form.Group className="mb-3">
            <Form.Label className="text-light">{returnTitle('create_proj.contract_number')}</Form.Label>
            <Form.Control
              type="text"
              name="contract_number"
              className="bg-transparent border text-light"
              value={form.contract_number}
              onChange={handleChange}
              placeholder={returnTitle('app.e.g.') + ' 54646546546546'}
              required
            />
          </Form.Group>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Group className="mb-3">
                <Form.Label className="text-light">{returnTitle('create_proj.total_price')} ({returnTitle('create_proj.uzs')})</Form.Label>
                <Form.Control
                  type="text"
                  name="total_price"
                  className="bg-transparent border text-light"
                  value={form.total_price}
                  onChange={handleChange}
                  inputMode="numeric"
                  required
                />
              </Form.Group>
              </div>
             <div className="col-md-6 mb-3">
                <Form.Group className="mb-3">
                <Form.Label className="text-light">
                  {returnTitle('create_proj.currency')}
                </Form.Label>
                <Select
                  options={currencyOptions}
                  value={form.currency}
                  onChange={(selected) => setForm({ ...form, currency: selected })}
                  placeholder={returnTitle('create_proj.select_currency')}
                  styles={customSelectStyles}
                  classNamePrefix="react-select"
                />
              </Form.Group>
            </div>
          </div>


          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label className="text-light">{returnTitle('app.start_date')}</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                className="bg-transparent border text-light"
                value={form.start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <Form.Label className="text-light">{returnTitle('app.end_date')}</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                className="bg-transparent border text-light"
                value={form.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Group className="mb-3">
                <Form.Label className="text-light">{returnTitle('create_proj.select_financier')}</Form.Label>
                <Select
                  options={financierOptions}
                  value={form.financier}
                  onChange={(selected) => setForm({ ...form, financier: selected })}
                  isClearable
                  placeholder={returnTitle('create_proj.select_financier')}
                  classNamePrefix="react-select"
                  styles={customSelectStyles}
                />
              </Form.Group>
            </div>
            <div className="col-md-6 mb-3">
              <Form.Group className="mb-4">
                <Form.Label className="text-light">{returnTitle('create_proj.select_partner')}</Form.Label>
                <Select
                  options={partnerOptions}
                  value={form.partner}
                  onChange={(selected) => setForm({ ...form, partner: selected })}
                  isClearable
                  placeholder={returnTitle('create_proj.select_partner')}
                  classNamePrefix="react-select"
                  styles={customSelectStyles}
                />
              </Form.Group>
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <Button variant="outline-light" onClick={onHide} disabled={submitting}>
              {submitting ? returnTitle('app.closing') + '...' : returnTitle('app.cancel')}
            </Button>
            <Button variant="warning" onClick={handleSubmit} disabled={submitting}>
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
