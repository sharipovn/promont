import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Alert from './Alert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useI18n } from '../context/I18nProvider';
import Select from 'react-select';

export default function HoldWorkOrderModal({ show, onHide, order, onHolded }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const [reason, setReason] = useState('');
  const [notifyStaff, setNotifyStaff] = useState(null);
  const [staffOptions, setStaffOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });

  useEffect(() => {
    if (show) {
      setLocked(false);
      setAlert({ show: false, variant: '', message: '' });

      if (order?.holded) {
        setReason(order.holded_reason || '');
      } else {
        setReason('');
        setNotifyStaff(null)
      }

      // Fetch staff users
      axiosInstance.get('/hold-work-order/staff-users/')
        .then((res) => {
          const options = res.data.map((staff) => ({
            label: `${staff?.fio} (${staff?.position_name || ' - '})`,
            value: staff?.user_id
          }));
          setStaffOptions(options);
            // If editing, pre-select the current "holded_for" user
            if (order?.holded && order?.holded_for) {
            const selected = options.find(opt => opt.value === order.holded_for);
            setNotifyStaff(selected || null);
            }
        })
        .catch(() => {
          setAlert({
            show: true,
            variant: 'danger',
            message: returnTitle('complete_wo.staff_list_fetch_failed'),
          });
          setStaffOptions([]);
        });
    }
  }, [show, order, axiosInstance]);

  const handleClose = () => {
    setReason('');
    setNotifyStaff(null);
    setAlert({ show: false, variant: '', message: '' });
    onHide();
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setAlert({ show: true, variant: 'info', message: returnTitle('complete_wo.empty_reason') });
      return;
    }

    if (!notifyStaff) {
      setAlert({ show: true, variant: 'info', message: returnTitle('complete_wo.staff_required') });
      return;
    }

    setLoading(true);
    const method = order?.holded ? 'put' : 'post';

    try {
      await axiosInstance[method](`/hold-work-order/${order.wo_id}/`, {
        holded_reason: reason.trim(),
        notify_staff: notifyStaff.value,
      });

      setLocked(true);
      setAlert({
        show: true,
        variant: 'success',
        message: returnTitle(order?.holded ? 'complete_wo.holded_updated' : 'complete_wo.holded_success'),
      });

      setTimeout(() => {
        handleClose();
        onHolded();
      }, 1000);
    } catch (err) {
      setAlert({
        show: true,
        variant: 'danger',
        message: returnTitle('complete_wo.holded_failed'),
      });
    } finally {
      setLoading(false);
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
    <Modal
      show={show}
      onHide={handleClose}
      centered
      contentClassName="custom-modal-content"
      backdropClassName="custom-backdrop"
    >
      <Modal.Body className="p-4">
        <h5 className="text-info mb-4">
          {returnTitle(order?.holded ? 'complete_wo.update_holded' : 'complete_wo.hold_work_order')}
        </h5>

        {alert.show && (
          <Alert
            variant={alert.variant}
            message={alert.message}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        )}

        <Form.Group className="mb-4">
          <Form.Label className="text-light small">
            {returnTitle('complete_wo.hold_reason_for')}{' '}
            <span className="text-info">"{order?.wo_name}"</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            className="bg-transparent border text-light custom-textarea rounded"
            placeholder={returnTitle('complete_wo.enter_hold_reason')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="text-light small">
            {returnTitle('complete_wo.select_notify_staff')}
          </Form.Label>
          <Select
            options={staffOptions}
            value={notifyStaff}
            onChange={setNotifyStaff}
            styles={customSelectStyles}
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder={returnTitle('complete_wo.select_staff')}
          />
        </Form.Group>

        <div className="d-flex justify-content-end gap-3">
          <Button variant="outline-secondary" onClick={handleClose} className="rounded-2 px-4" disabled={loading}>
            {returnTitle('app.cancel')}
          </Button>
          <Button
            variant="info"
            onClick={handleSubmit}
            className="rounded-2 px-4"
            disabled={loading || locked || !reason.trim()}
          >
            {loading
              ? returnTitle('complete_wo.sending')
              : returnTitle(order?.holded ? 'complete_wo.update' : 'complete_wo.confirm_hold')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
