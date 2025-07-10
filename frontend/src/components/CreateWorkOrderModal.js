import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useI18n } from '../context/I18nProvider';
import Alert from './Alert';
import Select from 'react-select';




export default function CreateWorkOrderModal({ show, onHide, part, onCreated }) {
  const { returnTitle } = useI18n();
  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useMemo(() => createAxiosInstance(navigate, setUser, setAccessToken), [navigate, setUser, setAccessToken]);

  const [orders, setOrders] = useState([
    { wo_no: '', wo_name: '', wo_start_date: '', wo_finish_date: '', wo_staff: null, error: '' }
  ]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [locked, setLocked] = useState(false);



  useEffect(() => {
    axiosInstance.get('/work-order/users-with-capability/', 
      { params: { 
        capability: 'CAN_COMPLETE_WORK_ORDER' ,
        tch_part_nach: part?.tch_part_nach  // ✅ Send part ID (like 9)
      }})
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
        setStaffOptions(options);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch staff:", err);
      });
  }, [show, part?.tch_part_code,axiosInstance]);

  const handleChange = (index, field, value) => {
    const updated = [...orders];
    updated[index][field] = value;
    updated[index].error = '';
    setOrders(updated);
  };

  const handleAdd = () => {
    setOrders([...orders, { wo_no: '', wo_name: '', wo_start_date: '', wo_finish_date: '', wo_staff: null, error: '' }]);
  };

  const handleRemove = (index) => {
    const updated = [...orders];
    updated.splice(index, 1);
    setOrders(updated);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const partStart = new Date(part.tch_start_date);
    const partEnd = new Date(part.tch_finish_date);

    const validated = orders.map((o) => {
      let error = '';
      if (!o.wo_no || !o.wo_name || !o.wo_start_date || !o.wo_finish_date || !o.wo_staff) {
        error = returnTitle('create_wo.all_fields_required');
      } else {
        const woStart = new Date(o.wo_start_date);
        const woEnd = new Date(o.wo_finish_date);
        if (woEnd < woStart) {
          error = returnTitle('create_wo.end_date_cannot_be_earlier_than_start_date');
        } else if (woStart < partStart || woEnd > partEnd) {
          error = returnTitle('create_wo.start_and_end_date_should_be_inside_tech_part_date_range');
        }
      }
      return { ...o, error };
    });

    const hasError = validated.some((o) => o.error);
    if (hasError) {
      setOrders(validated);
      setSubmitting(false);
      return;
    }

    const payload = {
      tch_part_code: part.tch_part_code,
      orders: validated.map((o) => ({
        wo_no: o.wo_no,
        wo_name: o.wo_name,
        wo_start_date: o.wo_start_date,
        wo_finish_date: o.wo_finish_date,
        wo_staff: o.wo_staff,
      })),
    };

    try {
      await axiosInstance.post('/work-order/create/', payload);
      setAlert({ show: true, variant: 'success', message: returnTitle('create_wo.work_order_created_successfully') });
      setLocked(true); // ✅ lock the UI after success
      setTimeout(() => {
        setAlert({ show: false, variant: '', message: '' });
        onHide();
        onCreated?.();
      }, 1000);
    } catch (err) {
      setAlert({ show: true, variant: 'danger', message: returnTitle('create_wo.work_order_creation_failed') });
    } finally {
      setSubmitting(false);
    }
  };

        const customSelectStyles = {
        control: (base) => ({
            ...base,
            backgroundColor: '#1e293b',
            borderColor: '#475569',
            color: 'white',
            minHeight: '40px',
            height: '40px',
            boxShadow: 'none',
        }),
        valueContainer: (base) => ({
            ...base,
            height: '40px',
            padding: '0 0.75rem',
        }),
        input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
        }),
        indicatorsContainer: (base) => ({
            ...base,
            height: '40px',
        }),
        singleValue: (base) => ({
            ...base,
            color: 'white',
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#1e293b',
            zIndex: 9999,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#334155' : '#1e293b',
            color: 'white',
        }),
        };

  return (
    <>
      {alert.show && <Alert message={alert.message} type={alert.variant} />}
      <Modal
        show={show}
        onHide={onHide}
        size="xl"
        centered
        backdrop="static"
        dialogClassName="custom-fin-modal full-width-modal"
      >
        <Modal.Body className="p-4 text-light">
          <h3 className="text-light mb-2">{returnTitle('create_wo.create_work_orders')}</h3>
          <h5 className="text-info mb-3">{part?.finance_part?.project?.project_name}</h5>
          <div className="fs-6 mb-3 text-white">
            {returnTitle('create_wo.technical_part')}: <strong>{part?.tch_part_no}</strong> - {part?.tch_part_name} ({part?.tch_start_date} - {part?.tch_finish_date})
          </div>

          {orders.map((order, index) => (
            <div key={index} className="border rounded p-3 mb-3 bg-dark bg-opacity-50">
              <Row className="align-items-end g-3">
                <Col md={1}><strong className="text-white">#{index + 1}</strong></Col>
                <Col md={1}>
                  <Form.Label>{returnTitle('create_wo.wo_no')}</Form.Label>
                  <Form.Control
                    type="number"
                    value={order.wo_no}
                    onChange={(e) => handleChange(index, 'wo_no', e.target.value)}
                    className="unified-input"
                  />
                </Col>
                <Col md={5}>
                  <Form.Label>{returnTitle('create_wo.wo_name')}</Form.Label>
                  <Form.Control
                    value={order.wo_name}
                    onChange={(e) => handleChange(index, 'wo_name', e.target.value)}
                    className="unified-input"
                  />
                </Col>
                <Col md={2}>
                  <Form.Label>{returnTitle('create_wo.start_date')}</Form.Label>
                  <Form.Control
                    type="date"
                    value={order.wo_start_date}
                    onChange={(e) => handleChange(index, 'wo_start_date', e.target.value)}
                    className="unified-input"
                  />
                </Col>
                <Col md={2}>
                  <Form.Label>{returnTitle('create_wo.finish_date')}</Form.Label>
                  <Form.Control
                    type="date"
                    value={order.wo_finish_date}
                    onChange={(e) => handleChange(index, 'wo_finish_date', e.target.value)}
                    className="unified-input"
                  />
                </Col>
                
                <Col md="auto">
                  <Button variant="outline-danger" onClick={() => handleRemove(index)}>
                    <FaTrash />
                  </Button>
                </Col>
              </Row>
              <Row className="align-items-end g-3">
                <Col md={1}></Col>
                <Col md={5}>
                  <Form.Label>{returnTitle('create_wo.staffusers')}</Form.Label>
                  <Select
                    options={staffOptions}
                    value={staffOptions.find(opt => opt.value === order.wo_staff) || null}
                    onChange={(opt) => handleChange(index, 'wo_staff', opt?.value || null)}
                    styles={customSelectStyles}
                    className="unified-input"
                    classNamePrefix="react-select"
                    menuPlacement="auto"
                    isOptionDisabled={(option) => option.not_selectable}
                  />
                </Col>
              </Row> 
              {order.error && (
                <div className="text-danger small mt-2 px-2">{order.error}</div>
              )}
            </div>
          ))}

          <Button variant="outline-info" onClick={handleAdd} className="mb-3">
            <FaPlus /> {returnTitle('create_wo.add_work_order')}
          </Button>

          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={onHide} className="px-4 rounded">
              {returnTitle('app.cancel')}
            </Button>
            <Button
              variant="success"
              className="px-4 rounded"
              onClick={handleSubmit}
              disabled={submitting || locked}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {returnTitle('create_wo.sending')}
                </>
              ) : (
                returnTitle('create_wo.submit')
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
