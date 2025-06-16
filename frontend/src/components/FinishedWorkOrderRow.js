import React, { useState } from 'react';
import HoverText from './HoverText';
import { useI18n } from '../context/I18nProvider';
import ConfirmFinishedWorkOrderModal from './ConfirmFinishedWorkOrderModal';
import UnlockFinishedWorkOrderModal from './UnlockFinishedWorkOrderModal';
import RefuseFinishedWorkOrderModal from './RefuseFinishedWorkOrderModal';
import { FaClipboardCheck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { TfiArrowCircleDown } from "react-icons/tfi";
import { formatDateTime } from '../utils/formatDateTime';
import { GiOpenFolder } from "react-icons/gi";
import { RiQuestionAnswerFill } from "react-icons/ri";
import { BiSolidCommentAdd } from "react-icons/bi";
import { FaLockOpen } from "react-icons/fa";
import {CONSTANTS} from '../constants/app_constants'


export default function FinishedWorkOrderRow({ order, onConfirmed, onRefuse }) {
  console.log('order:',order)
  const { returnTitle } = useI18n();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="financial-row d-flex flex-column gap-2 mb-2  pb-3">
          {/* Row top */}
           <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
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
                <span className="text-success">({order.tech_part?.finance_part?.project?.project_name})</span>
              </HoverText>
            </h6>
            <div className="text-secondary">
              {returnTitle('finish_wo.completed_staff_fio')}: {order.wo_staff_fio} ({formatDateTime(order.answer_date)})
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <button
              className="d-flex align-items-center gap-2 border btn text-success border-success rounded-3"
              onClick={() => setExpanded(prev => !prev)}
            >
              <TfiArrowCircleDown
                size={16}
                style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }}
              />
              {returnTitle('finish_wo.view_answer_details')}
            </button>

              {order.finished ? (
                <button
                  className="btn-icon-green rounded-3"
                  onClick={() => setShowUnlockModal(true)}
                >
                  <FaLockOpen className="me-1" size={14} />
                  {returnTitle('finish_wo.open_to_correct')}
                </button>
              ) : (
                <button
                  className="btn-icon-green rounded-3"
                  onClick={() => setShowConfirmModal(true)}
                >
                  <FaCheckCircle className="me-1" size={14} />
                  {returnTitle('finish_wo.mark_as_finished')}
                </button>
              )}





            {!order.finished && (
              <button
                className="btn-icon-red rounded-3"
                onClick={() => setShowRefuseModal(true)}
              >
                <FaTimesCircle className="me-1" size={14} />
                {order.last_status?.latest_action === CONSTANTS.WORK_ORDER_REFUSED_BY_NACH_OTDEL
                  ? returnTitle('finish_wo.update_refusal')
                  : returnTitle('finish_wo.refuse_completed_work_order')}
              </button>
            )}





          </div>
        </div>
            {/* Expanded content */}
            {expanded && (
              <div className="financial-row rounded d-flex flex-column  p-4 mb-2" style={{backgroundColor:'#1f1e25'}}>
                <p>
                  <strong><RiQuestionAnswerFill className='text-warning'/>{' '}{returnTitle('finish_wo.answer')}:</strong><br />
                  <span className='text-success mb-2 small ps-3 border-start border-secondary'>{order.wo_answer || '-'}</span>
                </p>
                <p>
                  <strong><BiSolidCommentAdd  className="text-warning" />{' '}{returnTitle('finish_wo.remark')}:</strong><br />
                  <span className='text-success mb-2 small ps-3 border-start border-secondary'>{order.wo_remark || '-'}</span>
                </p>
                {order.files?.length > 0 && (
                  <div className="mt-2">
                    <strong>
                      <GiOpenFolder className="text-warning" />{' '}{returnTitle('finish_wo.attached_files')}:
                    </strong>
                    <ul className="mb-0">
                      {order.files.map((file, idx) => (
                        <li key={idx} className='mb-1'>
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-info text-decoration-none"
                          >
                            {file.original_name || file.name || `File ${idx + 1}`}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {/* Expanded content */}
      </div>
         

      {/* Modals */}
      <UnlockFinishedWorkOrderModal
        show={showUnlockModal}
        onHide={() => setShowUnlockModal(false)}
        order={order}
        onConfirmed={onConfirmed}
      />
       {/* Modals */}
      <ConfirmFinishedWorkOrderModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        order={order}
        onConfirmed={onConfirmed}
      />
      <RefuseFinishedWorkOrderModal
        show={showRefuseModal}
        onHide={() => setShowRefuseModal(false)}
        order={order}
        onRefuse={onRefuse}
      />
    </>
  );
}
