import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Row, Col, Spinner } from 'react-bootstrap';
import { createAxiosInstance } from '../utils/createAxiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useI18n } from '../context/I18nProvider';
import { MdAdd, MdEdit } from "react-icons/md";
import HoverText from './HoverText';
import GipCreateTechnicalPartsModal from './GipCreateTechnicalPartsModal';
import './ViewModal.css';

export default function GipFinPartsModal({ show, onHide, project,onCreated,onUpdated }) {
  const { returnTitle } = useI18n();
  const [parts, setParts] = useState([]);
  const [loadingParts, setLoadingParts] = useState(true);
  const [selectedFinancePart, setSelectedFinancePart] = useState(null);

  const { setUser, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const axiosInstance = useMemo(
    () => createAxiosInstance(navigate, setUser, setAccessToken),
    [navigate, setUser, setAccessToken]
  );

  const fetchParts = () => {
    setLoadingParts(true);
    axiosInstance
      .get(`/gip-projects/fn-parts/${project.project_code}/`, {
        params: { send_to_tech_dir: true, tech_dir_confirm: true },
      })
      .then((res) => setParts(res.data))
      .catch((err) => console.error('❌ Refresh error:', err))
      .finally(() => setLoadingParts(false));
  };

  useEffect(() => {
    if (show && project?.project_code) {
      fetchParts();
    }
  }, [show, project?.project_code]);

  const handleOpenModal = (financePart) => setSelectedFinancePart(financePart);

  const handlePartModalClose = () => setSelectedFinancePart(null);

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="xl"
        centered
        backdrop="static"
        dialogClassName="custom-fin-modal"
      >
        <Modal.Body className="viewmodal-body">
          <h5 className="viewmodal-title">{returnTitle('gip.view_financial_parts')}</h5>

          {loadingParts ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="light" />
            </div>
          ) : (
            <div className="viewmodal-table">
              <Row className="fw-bold mb-2 px-2">
                <Col>{returnTitle('fn_part.fs_part_name')}</Col>
                <Col>{returnTitle('fn_part.fs_part_price')}</Col>
                <Col>{returnTitle('fn_part.fs_part_start_date')}</Col>
                <Col>{returnTitle('fn_part.fs_finish_date')}</Col>
                <Col>{returnTitle('fn_part.financier_fio')}</Col>
                <Col className="text-end">{returnTitle('gip.action')}</Col>
              </Row>
              {parts.map((part, index) => (
                <Row key={index} className="border-top py-2 px-2 align-items-center">
                  <Col>{part.fs_part_name || '-'}</Col>
                  <Col>{Number(part.fs_part_price || 0).toLocaleString()} {returnTitle(`currency.${project?.currency_name?.toLowerCase()}`)}</Col>
                  <Col>{part.fs_start_date}</Col>
                  <Col>{part.fs_finish_date}</Col>
                  <Col><HoverText>{part.financier_fio || '-'}</HoverText></Col>
                  <Col className="text-end">
                    <Button
                      variant={part.existing_tech_parts?.length ? "outline-warning" : "outline-primary"}
                      size="sm"
                      onClick={() => handleOpenModal(part)}
                    >
                      {part.existing_tech_parts?.length ? <><MdEdit /> {returnTitle('gip.update_tech_parts')}</> : <><MdAdd /> {returnTitle('gip.add_tech_parts')}</>}
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>
          )}

          <div className="d-flex justify-content-end mt-4">
            <Button className="viewmodal-btn-cancel" onClick={onHide}>
              {returnTitle('app.close')}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      {selectedFinancePart && (
        <GipCreateTechnicalPartsModal
          show={!!selectedFinancePart}
          onHide={handlePartModalClose}
          financialPart={selectedFinancePart}
          project={project}
          onCreated={() => {
            handlePartModalClose();
            fetchParts();
          }}
          onUpdated={onUpdated}    // Pass down
        />
      )}
    </>
  );
}
