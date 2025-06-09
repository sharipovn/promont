import React, { useState } from 'react';
import HoverText from './HoverText';
import { useI18n } from '../context/I18nProvider';
import { Button } from 'react-bootstrap';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import RefuseTechPartModal from './RefuseTechPartModal';
import ConfirmTechPartModal from './ConfirmTechPartModal';
import CreateWorkOrderModal from './CreateWorkOrderModal';
import UpdateWorkOrderModal from './UpdateWorkOrderModal';

import { GrTasks } from "react-icons/gr";
import { FiEdit } from "react-icons/fi";
import { MdAddToPhotos } from "react-icons/md";


export default function GipPartRow({ part, onConfirmed, onRefuse }) {
  const { returnTitle } = useI18n();
  const confirmed = part.nach_otd_confirm;
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  console.log('part:',part)

  const handleRefuseClick = () => {
    setShowRefuseModal(true);
  };

  return (
    <>
      <div className="financial-row d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        {/* Left info */}
        <div className="flex-grow-1">
          <h6 className="fw-bold mb-1 fs-6 d-flex flex-wrap align-items-center gap-1">
            <HoverText>
              <span className="text-info">
                {part.finance_part.fs_part_no}.{part.tch_part_no}
              </span>
            </HoverText>
            <HoverText>
              <span className="text-success">{part.tch_part_name}</span>
            </HoverText>
            <HoverText>
              <span className="text-success">
                ({part.finance_part.project.project_name})
              </span>
            </HoverText>
          </h6>
          <div className="text-secondary">
            {returnTitle('create_wo.given_period')}: {part.tch_start_date} → {part.tch_finish_date}
            {differenceInCalendarDays(parseISO(part.tch_finish_date), new Date()) > 0 && (
              <>
                {' • '}
                <span className="badge bg-success ms-1">
                  {differenceInCalendarDays(parseISO(part.tch_finish_date), new Date())}{' '}
                  {returnTitle('create_wo.days_left')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {/* 🧾 Work order count */}
            {part.count_of_work_orders > 0 && (
              <span className="financial-action-btn fw-bold send-btn text-info disabled d-flex align-items-center gap-1">
                <GrTasks/> {part.count_of_work_orders} work orders
              </span>
            )}

            {/* ✅ Status 
            <span
              className={`financial-action-btn fw-bold send-btn ${
                confirmed
                  ? 'text-success'
                  : part?.last_status?.latest_action === 'TECH_PART_REFUSED'
                  ? 'text-danger'
                  : 'text-warning'
              } disabled`}
            >
              {confirmed
                ? returnTitle('create_wo.confirmed')
                : part?.last_status?.latest_action === 'TECH_PART_REFUSED'
                ? returnTitle('create_wo.refused')
                : returnTitle('create_wo.not_confirmed')}
            </span>*/}


        {confirmed ? (
            <>
              {part.count_of_work_orders > 0 ? (
                <Button variant="warning" className='rounded-3' onClick={() => setShowUpdateModal(true)}>
                  <FiEdit /> {returnTitle('create_wo.update_work_orders')}
                </Button>
              ) : (
                <Button variant="info"  className='rounded-3' onClick={() => setShowWorkOrderModal(true)}>
                  <MdAddToPhotos/> {returnTitle('create_wo.create_work_orders')}
                </Button>
              )}
            </>
          ) : (
            <>
              <button className="btn-icon-green rounded-3" onClick={() => setShowConfirmModal(true)}>
                <FaCheckCircle className="me-1" size={14} /> {returnTitle('create_wo.confirm')}
              </button>
              <button className="btn-icon-red rounded-3" onClick={handleRefuseClick}>
                <FaTimesCircle className="me-1" size={14} />
                {part?.last_status?.latest_action === 'TECH_PART_REFUSED'
                  ? returnTitle('create_wo.update_refusal')
                  : returnTitle('create_wo.refuse')}
              </button>
            </>
          )}

        </div>
      </div>

      {/* Refuse modal */}
      <RefuseTechPartModal
        show={showRefuseModal}
        onHide={() => setShowRefuseModal(false)}
        part={part}
        onRefuse={onRefuse}
      />
      <ConfirmTechPartModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        part={part}
        onConfirmed={onConfirmed}
      />
      <CreateWorkOrderModal
        show={showWorkOrderModal}
        onHide={() => setShowWorkOrderModal(false)}
        part={part}
        onCreated={onConfirmed}  // Optionally re-fetch parts list after creation
      />
      <UpdateWorkOrderModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        part={part}
        onUpdated={onConfirmed}
      />

    </>
  );
}
