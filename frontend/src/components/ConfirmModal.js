import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ConfirmModal({ show, onHide, onConfirm, project }) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="custom-modal-content"
      backdropClassName="custom-backdrop"
    >
      <Modal.Body className="p-4">
        <h5 className="text-info mb-3">Confirm Project</h5>
        <p>
          Are you sure you want to <strong>confirm</strong> the project{' '}
          <strong className="text-light">"{project?.project_name}"</strong>?
        </p>

        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button variant="outline-secondary" onClick={onHide} className="rounded-pill px-4">
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => onConfirm(project)}
            className="rounded-pill px-4"
          >
            Yes, I confirm
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
