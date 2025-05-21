import React,{useState} from 'react';
import { FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import HoverText from './HoverText';
import ViewModal from './ViewModal';
import { formatDateTime } from '../utils/formatDateTime';
import './FinArchiveRow.css'; // reuse same styling

export default function VerifyTechDirRow({ proj }) {
  const isVerified = proj.all_tech_dir_confirmed;
  const [showViewModal, setShowViewModal] = useState(false);


  return (
    <div
      className="financial-row d-flex flex-column flex-md-row justify-content-between align-items-start gap-3"
    >
      {/* Left side info */}
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

      {/* Right side status + view button */}
      <div className="d-flex flex-row align-items-center gap-3 mt-3 mt-md-0">
        {/* Status */}
        <span
          className={`fw-semibold d-flex align-items-center gap-2 ${
            isVerified ? 'text-success' : 'text-warning'
          }`}
        >
          {isVerified ? (
            <>
              <FaCheckCircle size={14} /> VERIFIED BY TECH
            </>
          ) : (
            <>
              <FaTimesCircle size={14} /> NOT VERIFIED
            </>
          )}
        </span>

        {/* View Button */}
        <button
          className="financial-action-btn send-btn"
          onClick={() => setShowViewModal(true)}
        >
          <FaEye size={14} /> View
        </button>
        <ViewModal
            show={showViewModal}
            onHide={() => setShowViewModal(false)}
            project={proj}
            />
      </div>
    </div>
  );
}
