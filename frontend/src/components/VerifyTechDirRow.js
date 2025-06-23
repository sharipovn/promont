import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import HoverText from './HoverText';
import ViewModal from './ViewModal';
import { formatDateTime } from '../utils/formatDateTime';
import { VscSyncIgnored } from "react-icons/vsc";
import './FinArchiveRow.css';
import { useI18n } from '../context/I18nProvider';

export default function VerifyTechDirRow({ proj,onVerified}) {
  const isVerified = proj.all_tech_dir_confirmed;
  const [showViewModal, setShowViewModal] = useState(false);

  const { returnTitle } = useI18n();

  return (
    <>
      <div
        className="financial-row d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
        style={{ minHeight: '80px' }}
      >
        {/* Left side info */}
        <div className="flex-grow-1">
          <h6 className="text-success mb-1 fs-6">
            <HoverText>{proj.project_name}</HoverText>
          </h6>
          <div className="text-light mb-1 fs-6">
            <strong>{returnTitle('app.created_by')}:</strong> {proj.create_user_fio}{' '}
            <span className="normal-style">({formatDateTime(proj.create_date)})</span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="d-flex flex-row align-items-center gap-3">
          <span
            className={`fw-semibold d-flex align-items-center gap-2 ${
              proj.last_status?.latest_action === 'TECH_DIR_REFUSED'
                ? 'financial-action-btn send-btn'
                : isVerified
                ? 'text-success financial-action-btn send-btn'
                : 'text-warning financial-action-btn send-btn'
            }`}
          >
            {proj.last_status?.latest_action === 'TECH_DIR_REFUSED' ? (
              <>
                <VscSyncIgnored size={14} /> {returnTitle('verify_tech_fin.refused').toUpperCase()}
              </>
            ) : isVerified ? (
              <>
                <FaCheckCircle size={14} /> {returnTitle('verify_tech_fin.verified').toUpperCase()}
              </>
            ) : (
              <>
                <FaTimesCircle size={14} /> {returnTitle('verify_tech_fin.not_verified').toUpperCase()}
              </>
            )}
          </span>


          <button
            className="financial-action-btn send-btn"
            onClick={() => setShowViewModal(true)}
          >
            <FaEye size={14} /> {returnTitle('verify_tech_fin.veriview_and_confirm')}
          </button>
        </div>
      </div>

      {/* View Modal */}
      <ViewModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        project={proj}
        parts={proj.finance_parts}
        onVerified={onVerified}
      />
    </>
  );
}
