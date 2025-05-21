import React, { useState, useMemo } from 'react';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Select from 'react-select';
import './ViewModal.css'; // ✅ New CSS file

export default function ViewModal({ show, onHide, project, parts = [] }) {
  const [showRefuse, setShowRefuse] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedGip, setSelectedGip] = useState(null);

  const gipOptions = [
    { value: 'gip1.pdf', label: 'GIP File 1' },
    { value: 'gip2.pdf', label: 'GIP File 2' },
  ];

  const selectStyles = useMemo(() => ({
    control: (base) => ({
      ...base,
      backgroundColor: '#2e3e5b',
      borderColor: '#334155',
      color: 'white',
    }),
    menu: (base) => ({ ...base, backgroundColor: '#2e3e5b' }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? '#3e5e95' : '#2e3e5b',
      color: 'white',
    }),
    singleValue: (base) => ({ ...base, color: 'white' }),
  }), []);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      backdrop="static"
      dialogClassName="custom-fin-modal"
    >
      <Modal.Body className="viewmodal-body">
        <h5 className="viewmodal-title">CHECK AND VERIFY (BY TECH DIR)</h5>

        <div className="viewmodal-table">
          <Row className="fw-bold mb-2 px-2">
            <Col>Part Name</Col>
            <Col>Price</Col>
            <Col>Start Date</Col>
            <Col>Finish Date</Col>
            <Col>Financier</Col>
          </Row>
          {parts.map((part, index) => (
            <Row key={index} className="border-top py-2 px-2">
              <Col>{part.fs_part_name || '-'}</Col>
              <Col>{Number(part.fs_part_price || 0).toLocaleString()} so'm</Col>
              <Col>{part.fs_start_date}</Col>
              <Col>{part.fs_finish_date}</Col>
              <Col>{part.financier_fio || '-'}</Col>
            </Row>
          ))}
        </div>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div style={{ minWidth: '250px' }}>
            <label className="text-light mb-1">Attach GIP</label>
            <Select
            className='rounded'
              options={gipOptions}
              value={selectedGip}
              onChange={setSelectedGip}
              placeholder="Select GIP file"
              styles={selectStyles}
            />
          </div>

          <div className="d-flex flex-wrap gap-3 ms-auto">
            <Button className="viewmodal-btn-confirm">
              <FaCheckCircle className="me-2" /> Verified and Confirmed
            </Button>

            <Button
              className="viewmodal-btn-refuse"
              onClick={() => setShowRefuse(!showRefuse)}
            >
              <FaTimesCircle className="me-2" /> Refuse
            </Button>
          </div>
        </div>

        {showRefuse && (
          <>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Write refusal reason here..."
              className="viewmodal-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="d-flex justify-content-end">
              <Button className="viewmodal-btn-refuse-submit">
                Confirm Refusal
              </Button>
            </div>
          </>
        )}

        <div className="d-flex justify-content-end mt-4">
          <Button className="viewmodal-btn-cancel" onClick={onHide}>
            Cancel
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
