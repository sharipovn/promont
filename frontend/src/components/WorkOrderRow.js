import React, { useState } from 'react';
import HoverText from './HoverText';
import { useI18n } from '../context/I18nProvider';
import RefuseWorkOrderModal from './RefuseWorkOrderModal';
import WorkOrderConfirmModal from './WorkOrderConfirmModal';
import {CONSTANTS} from '../constants/app_constants'
import CompleteWorkOrderModal from './CompleteWorkOrderModal';
import HoldWorkOrderModal from './HoldWorkOrderModal';
import { BsFillPauseCircleFill } from "react-icons/bs";



import { differenceInCalendarDays, parseISO } from 'date-fns';
import { FaCheckCircle,FaClipboardCheck, FaTimesCircle } from 'react-icons/fa';

export default function WorkOrderRow({ order, onRefuse,onConfirmed,onCompleted }) {
  const { returnTitle } = useI18n();
  const confirmed = order.staff_confirm;
  const refused = order.last_status?.latest_action === 'WORK_ORDER_REFUSED';
  const hasAnswer = !!order.wo_answer;


  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);


  

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
                {order.tech_part?.finance_part?.fs_part_no}.{order.tech_part?.tch_part_no}.{order.wo_no}
              </span>
            </HoverText>
            <HoverText>
              <span className="text-success">{order.wo_name}</span>
            </HoverText>
            <HoverText>
              <span className="text-success">
                ({order.tech_part?.finance_part?.project?.project_name})
              </span>
            </HoverText>
          </h6>
          <div className="text-secondary">
            {returnTitle('complete_wo.given_period')}: {order.wo_start_date} → {order.wo_finish_date}
            {differenceInCalendarDays(parseISO(order.wo_finish_date || ''), new Date()) > 0 && (
              <>
                {' • '}
                <span className="badge bg-success ms-1">
                  {differenceInCalendarDays(parseISO(order.wo_finish_date || ''), new Date())} {returnTitle('complete_wo.days_left')}
                </span>
              </>
            )}
          </div>
        </div>
          {!order?.finished && order?.staff_confirm && order?.last_status?.latest_action === CONSTANTS.WORK_ORDER_REFUSED_BY_NACH_OTDEL && (
            <span
              className="financial-action-btn fw-semibold send-btn text-danger disabled"
              style={{ fontSize: '1rem' }}
              title={order?.last_status?.comment || ''}
            >
              {returnTitle('complete_wo.refused_by_nach_otdel')}
            </span>
          )}



        {/* Right actions */}
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {/* Status badge */}
          {confirmed ? (
            <span className="financial-action-btn fw-bold send-btn text-success disabled">
              {returnTitle('complete_wo.confirmed')}
            </span>
          ) : refused ? (
            <span className="financial-action-btn fw-bold send-btn text-danger disabled">
              {returnTitle('complete_wo.refused')}
            </span>
          ) : (
            <span className="financial-action-btn fw-bold send-btn text-warning disabled">
              {returnTitle('complete_wo.not_confirmed')}
            </span>
          )}


          


          {/* Actions */}
            {confirmed ? (
              <>
              {!order?.finished && !hasAnswer && (
                <button className="btn btn-success rounded-3 d-flex align-items-center gap-1" onClick={() => setShowHoldModal(true)}>
                  <BsFillPauseCircleFill size={14} />
                  <span>
                    {order?.holded
                      ? returnTitle('complete_wo.update_holded')
                      : returnTitle('complete_wo.hold_work_order')}
                  </span>
                </button>
              )}

              <button className="btn-icon-green rounded-3" onClick={() => setShowCompleteModal(true)}>
              <FaClipboardCheck className="me-1" size={14} />{' '}
                  {
                  order?.finished
                    ? returnTitle('complete_wo.finished_already')
                    : hasAnswer
                      ? returnTitle('complete_wo.update_complete')
                      : returnTitle('complete_wo.complete_work_order')
                  }
              </button>
              </>
            ) : (
              <>
                <button className="btn-icon-green rounded-3" onClick={() => setShowConfirmModal(true)}>
                  <FaCheckCircle className="me-1" size={14} /> {returnTitle('complete_wo.confirm')}
                </button>

                <button className="btn-icon-red rounded-3" onClick={handleRefuseClick}>
                  <FaTimesCircle className="me-1" size={14} />
                  {refused
                    ? returnTitle('complete_wo.update_refusal')
                    : returnTitle('complete_wo.refuse')}
                </button>
              </>
            )}

        </div>
      </div>

      <RefuseWorkOrderModal
        show={showRefuseModal}
        onHide={() => setShowRefuseModal(false)}
        order={order}
        onRefuse={onRefuse}
      />
      <WorkOrderConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        order={order}
        onConfirmed={onConfirmed}
      />

      <CompleteWorkOrderModal
        show={showCompleteModal}
        onHide={() => setShowCompleteModal(false)}
        order={order}
        onCompleted={onCompleted}
      />
      <HoldWorkOrderModal
        show={showHoldModal}
        onHide={() => setShowHoldModal(false)}
        order={order}
        onHolded={onCompleted}
      />


    </>
  );
}
