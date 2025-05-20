import React, { useState } from 'react';
import { FaPlusCircle, FaEdit } from 'react-icons/fa';
import HoverText from './HoverText';
import { formatDateTime } from '../utils/formatDateTime';
import './FinArchiveRow.css';
import FinancialPartsModal from './FinancialPartsModal'; // import the modal
import UpdateFinancialPartsModal from './UpdateFinancialPartsModal';




export default function FinArchiveRow({ proj,onCreated  }) {
  const hasFinancialParts = proj.finance_parts_count > 0;
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const handleClick = () => {
    hasFinancialParts ? setShowUpdateModal(true) : setShowModal(true);
  };

  const handleCloseAndRefresh = (setter) => {
    setter(false);
    onCreated?.(); // refresh archive
  };

  return (
      <>
    <div
  className="financial-row d-flex flex-column flex-md-row justify-content-between align-items-start gap-3"
>

      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="text-success mb-0">
            <HoverText>{proj.project_name}</HoverText>
          </h6>
        </div>

        <div className="small text-light">
          <div>
            <strong>Created by:</strong> {proj.create_user_fio}{' '}
            <span className="normal-style">({formatDateTime(proj.create_date)})</span>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row align-items-center gap-2 mt-3 mt-md-0">
        {proj.finance_parts_count > 0 && (
        <span className="fs-parts-badge">
            {proj.finance_parts_count} Part{proj.finance_parts_count > 1 ? 's' : ''}
        </span>
        )}

        <button
            className={`financial-action-btn ${hasFinancialParts ? 'edit-btn' : 'create-btn'}`}
            onClick={handleClick}
        >
            {hasFinancialParts ? (
            <>
                <FaEdit size={14} /> Edit Parts
            </>
            ) : (
            <>
                <FaPlusCircle size={14} /> Make Financial Parts
            </>
            )}
        </button>
        </div>
    </div>
      <FinancialPartsModal
          show={showModal}
          onHide={() => setShowModal(false)}
          project={proj}
          onCreated={() => handleCloseAndRefresh(setShowModal)}
      />
      <UpdateFinancialPartsModal
          show={showUpdateModal}
          onHide={() => setShowUpdateModal(false)}
          project={proj}
          onUpdated={() => handleCloseAndRefresh(setShowUpdateModal)}
      />
     </>
  );
}
