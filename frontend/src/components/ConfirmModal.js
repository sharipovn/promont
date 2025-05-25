import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';


export default function ConfirmModal({ show, onHide, onConfirm, project }) {


  const {returnTitle}=useI18n()


  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="custom-modal-content"
      backdropClassName="custom-backdrop"
    >
      <Modal.Body className="p-4">
        <h5 className="text-info mb-4">{returnTitle('fin_confirm.confirm_project')}</h5>

        <div className="mb-4 ">
          <div className="mb-3">
            <label className="small">{returnTitle('fin_confirm.project_name')}</label>
            <div className="border-bottom pb-1 text-light">
              {project?.project_name}
            </div>
          </div>

          <div className="mb-3">
            <label className="small">{returnTitle('fin_confirm.total_price')}</label>
            <div className="border-bottom pb-1 text-light">
              {Number(project?.total_price).toLocaleString()} UZS
            </div>
          </div>

          <div className="mb-3">
            <label className="small">{returnTitle('app.start_date')}</label>
            <div className="border-bottom pb-1 text-light">
              {project?.start_date}
            </div>
          </div>

          <div className="mb-3">
            <label className="small">{returnTitle('app.end_date')}</label>
            <div className="border-bottom pb-1 text-light">
              {project?.end_date}
            </div>
          </div>

          {project?.partner_name && (
            <div className="mb-3">
              <label className="tsmall">{returnTitle('fin_confirm.partner')}</label>
              <div className="border-bottom pb-1 text-light">
                {project.partner_name}({project.partner_inn})
              </div>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-end gap-3">
          <Button variant="outline-secondary" onClick={onHide} className="rounded-pill px-4">
            {returnTitle('app.cancel')}
          </Button>
          <Button
            variant="success"
            onClick={() => onConfirm(project)}
            className="rounded-pill px-4"
          >
            {returnTitle('fin_confirm.yes_i_confirm')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
