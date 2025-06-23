import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function RefuseModal({ show, onHide, onRefuseConfirm, project }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onRefuseConfirm(project, comment);
      setComment('');
      onHide();
    } catch (err) {
      console.error('❌ Refusal failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setComment('');
    onHide();
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
        <h5 className="text-danger mb-4">Refuse Project</h5>

        <Form.Group className="mb-4">
          <Form.Label className="text-light small">
            Why are you refusing the project{' '}
            <span className="text-info">"{project?.project_name}"</span>?
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            className="bg-transparent border text-light custom-textarea"
            placeholder="Write your reason here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Form.Group>

        <div className="d-flex justify-content-end gap-3">
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            className="rounded-pill px-4"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            className="rounded-pill px-4"
            disabled={loading || !comment.trim()}
          >
            {loading ? 'Sending...' : 'Confirm Refusal'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
