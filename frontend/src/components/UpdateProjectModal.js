import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import { MdEdit } from 'react-icons/md';
import { useI18n } from '../context/I18nProvider';
import { withValidation } from '../utils/withValidation';

export default function UpdateProjectModal({ show, onHide, onSubmit, partnerOptions, financierOptions, initialData }) {
  const { returnTitle } = useI18n();

  const [form, setForm] = useState({
    project_name: '',
    total_price: '',
    start_date: '',
    end_date: '',
    financier: null,
    partner: null,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        project_name: initialData.project_name || '',
        total_price: initialData.total_price?.toLocaleString('en-US') || '',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        financier: financierOptions.find(opt => opt.value === initialData.financier) || null,
        partner: partnerOptions.find(opt => opt.value === initialData.partner) || null,
      });
    }
  }, [initialData, financierOptions, partnerOptions]);

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
    const payload = {
      ...form,
      total_price: parseInt(form.total_price.replace(/\s/g, ''), 10),
      financier: form.financier?.value || null,
      partner: form.partner?.value || null,
    };

    setSubmitting(true);
    await onSubmit(payload);
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Body className="p-4 text-light">
        <h5 className="text-warning mb-4">
          <MdEdit className="me-2" />
          {returnTitle('create_proj.update_project')}
        </h5>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{returnTitle('create_proj.project_name')}</Form.Label>
            <Form.Control
              type="text"
              name="project_name"
              value={form.project_name}
              onChange={handleChange}
              required
              {...withValidation(returnTitle('create_proj.project_name_required'))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{returnTitle('create_proj.total_price')} (UZS)</Form.Label>
            <Form.Control
              type="text"
              name="total_price"
              value={form.total_price}
              onChange={handleChange}
              inputMode="numeric"
              required
              {...withValidation(returnTitle('create_proj.total_price_required'))}
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Label>{returnTitle('app.start_date')}</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <Form.Label>{returnTitle('app.end_date')}</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>{returnTitle('create_proj.select_financier')}</Form.Label>
            <Select
              options={financierOptions}
              value={form.financier}
              onChange={(selected) => setForm({ ...form, financier: selected })}
              isClearable
              placeholder={returnTitle('create_proj.select_financier')}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{returnTitle('create_proj.select_partner')}</Form.Label>
            <Select
              options={partnerOptions}
              value={form.partner}
              onChange={(selected) => setForm({ ...form, partner: selected })}
              isClearable
              placeholder={returnTitle('create_proj.select_partner')}
            />
          </Form.Group>

          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" onClick={onHide} disabled={submitting}>
              {returnTitle('app.cancel')}
            </Button>
            <Button variant="warning" onClick={handleSubmit} disabled={submitting}>
              {submitting ? returnTitle('app.updating') + '...' : returnTitle('app.update')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
